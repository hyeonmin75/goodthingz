const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8790';
const client = 'ca-pub-1998974659917167';
const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;

async function main() {
  const ads = await fetch(base + '/ads.txt');
  assert.equal(ads.status, 200);
  assert.match(ads.headers.get('content-type'), /^text\/plain/);
  assert.equal(await ads.text(), 'google.com, pub-1998974659917167, DIRECT, f08c47fec0942fa0\n');
  const robots = await (await fetch(base + '/robots.txt')).text();
  assert.match(robots, /Allow: \/\n/);
  assert.doesNotMatch(robots, /Disallow: \/(?:ads\.txt)?\s*$/m);
  for (const route of ['/', '/?keyword=test', '/pet-travel', '/pet-travel?keyword=test', '/pet-travel/plan', '/pet-travel/guides', '/privacy', '/adsense-audit-missing']) {
    const response = await fetch(base + route);
    assert.equal(response.status, route.endsWith('missing') ? 404 : 200);
    const html = await response.text();
    const head = html.split('</head>')[0];
    assert.match(head, new RegExp(`name="google-adsense-account" content="${client}"`));
    const scripts = [...html.matchAll(/<script\b[^>]*src="https:\/\/pagead2\.googlesyndication\.com[^>]*>/g)];
    assert.equal(scripts.length, route === '/' ? 1 : 0, route);
    if (route === '/') {
      assert.ok(head.includes(scripts[0][0]), 'Snippet must be in server-rendered head');
      assert.ok(scripts[0][0].includes(`src="${src}"`));
      assert.match(scripts[0][0], /\basync(?:="")?/);
      assert.match(scripts[0][0], /crossorigin="anonymous"/i);
    }
  }
  const browser = await chromium.launch({ headless: true, channel: process.env.AUDIT_BROWSER_CHANNEL || undefined });
  const reports = [];
  try {
    for (const width of [360, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      // Simulate the third-party runtime without making real ad requests.
      await page.route('https://pagead2.googlesyndication.com/**', route => route.fulfill({
        contentType: 'application/javascript', body: 'window.__adsenseAuditLoaded = true;',
      }));
      await page.route('https://**.doubleclick.net/**', route => route.abort());
      for (const selector of ['.top-nav a[href="/pet-travel/plan"]', 'footer a[href="/privacy"]', '.home-guide']) {
        await page.goto(base + '/');
        await page.waitForFunction(() => window.__adsenseAuditLoaded === true);
        assert.equal(await page.locator(`head script[src="${src}"]`).count(), 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const link = page.locator(selector).first();
        const destination = await link.getAttribute('href');
        await Promise.all([page.waitForURL(base + destination), link.click()]);
        await page.waitForLoadState('domcontentloaded');
        assert.equal(await page.evaluate(() => window.__adsenseAuditLoaded), undefined, 'Leaving homepage must clear the ad runtime');
        assert.equal(await page.locator('script[src*="pagead2.googlesyndication.com"]').count(), 0);
      }
      // Entering home through client navigation must also load the snippet once.
      await page.locator('.top-nav a[href="/"]').click();
      await page.waitForURL(base + '/');
      await page.waitForFunction(() => window.__adsenseAuditLoaded === true);
      assert.equal(await page.locator(`head script[src="${src}"]`).count(), 1);
      await page.locator('.top-nav a[href="/pet-travel/plan"]').click();
      await page.waitForURL(base + '/pet-travel/plan');
      assert.equal(await page.evaluate(() => window.__adsenseAuditLoaded), undefined);
      assert.deepEqual(errors, [], 'Browser runtime errors');
      reports.push({ width, snippet: 'PASS', navigationIsolation: 'PASS', runtimeErrors: errors.length });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify({ adsTxt: 'PASS', ssrHead: 'PASS', excludedPages: 'PASS', reports }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

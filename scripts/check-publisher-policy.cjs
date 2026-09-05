const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8790';

async function main() {
  const indexPaths = ['/', '/pet-travel', '/about', '/privacy', '/data-sources/kto-pet-tour', '/pet-travel/guides/visit-checklist'];
  for (const route of indexPaths) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route);
    assert.match(html, /google-adsense-account/);
    assert.match(html, /href="\/privacy"/);
    assert.doesNotMatch(html, /<script[^>]+src="https:\/\/pagead2/);
    assert.match(html, /rel="canonical"/);
  }
  for (const route of ['/pet-travel/search', '/pet-travel/compare']) {
    const response = await fetch(base + route, { redirect: 'manual' });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), '/pet-travel#results');
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
  }
  for (const route of ['/publisher-audit-missing', '/pet-travel/places/unknown']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 404);
    assert.match(await response.text(), /noindex,follow/);
  }
  assert.match(await (await fetch(base + '/pet-travel?keyword=test')).text(), /noindex,follow/);
  const sitemap = await (await fetch(base + '/sitemap.xml')).text();
  assert.equal((sitemap.match(/<loc>/g) || []).length, indexPaths.length);
  assert.doesNotMatch(sitemap, /\/search|\/compare|\/places\//);
  assert.equal((await (await fetch(base + '/ads.txt')).text()).trim(), 'google.com, pub-1998974659917167, DIRECT, f08c47fec0942fa0');
  const api = await fetch(base + '/api/public-data/pet-tour/places?page=1&pageSize=3');
  assert.equal(api.status, 200);
  const payload = await api.json();
  assert.equal(payload.ok, true);
  assert.ok(payload.data.items.length > 0);
  assert.doesNotMatch(JSON.stringify(payload), /PUBLIC_DATA_API_KEY|serviceKey/i);
  assert.equal((await fetch(base + '/api/public-data/pet-tour/places?page=-1')).status, 400);
  const browser = await chromium.launch({ headless: true, channel: process.env.AUDIT_BROWSER_CHANNEL || undefined });
  const reports = [];
  const screenshots = path.resolve('.wrangler/policy-audit');
  fs.mkdirSync(screenshots, { recursive: true });
  try {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 844 } });
      // Synthetic position only. No device location or live location request is used.
      await context.addInitScript(() => {
        window.__locationCalls = 0;
        Object.defineProperty(navigator, 'share', { value: async data => { window.__sharedData = data; } });
        Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition(success) {
          window.__locationCalls++;
          success({ coords: { latitude: 37.5665, longitude: 126.978 } });
        } } });
      });
      const page = await context.newPage();
      const errors = [];
      const requests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => requests.push(request.url()));
      await page.route('**/api/public-data/pet-tour/places?**', route => route.fulfill({ json: payload }));
      await page.route('**/api/public-data/pet-tour/place?**', route => route.fulfill({ status: 503, json: { ok: false, error: { message: 'Test detail unavailable' } } }));
      await page.route('https://www.openstreetmap.org/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Test map</p>' }));
      for (const route of ['/', '/privacy', '/pet-travel']) {
        await page.goto(base + route);
        await page.locator('footer').waitFor();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} ${route} overflow`);
        await page.screenshot({ path: path.join(screenshots, `${width}-${route.replace(/\W/g, '') || 'home'}.png`), fullPage: true });
      }
      await page.locator('.place-card').first().waitFor();
      page.once('dialog', dialog => dialog.dismiss());
      await page.getByRole('region', { name: '검색과 필터' }).getByRole('button', { name: '내 위치 조회', exact: true }).click();
      assert.equal(await page.evaluate(() => window.__locationCalls), 0, 'Cancel must not read location');
      assert.equal(requests.some(url => url.includes('latitude=')), false);
      page.once('dialog', async dialog => {
        assert.match(dialog.message(), /한국관광공사/);
        assert.match(dialog.message(), /OpenStreetMap/);
        await dialog.accept();
      });
      const locationRequest = page.waitForRequest(request => request.url().includes('latitude=37.5665'));
      await page.getByRole('region', { name: '검색과 필터' }).getByRole('button', { name: '내 위치 조회', exact: true }).click();
      await locationRequest;
      assert.equal(await page.evaluate(() => window.__locationCalls), 1);
      assert.ok(await page.getByRole('button', { name: '1km', exact: true }).isEnabled());
      if (width === 390) await page.getByRole('button', { name: '목록', exact: true }).click();
      await page.locator('.place-card').first().getByRole('button', { name: '저장', exact: true }).click();
      if (width === 390) await page.getByRole('button', { name: '지도와 상세', exact: true }).click();
      await page.locator('.saved-panel').getByRole('button', { name: '공유', exact: true }).click();
      const shared = await page.evaluate(() => window.__sharedData.text);
      assert.match(shared, /https:\/\/goodthingfor.com\/pet-travel/);
      assert.doesNotMatch(shared, /37\.5665|126\.978|거리 정보|\d+(\.\d+)?km/);
      const privacyLink = page.locator('footer').getByRole('link', { name: '개인정보 처리 안내', exact: true });
      await privacyLink.focus();
      await page.keyboard.press('Enter');
      await page.waitForURL('**/privacy');
      assert.ok(await page.getByRole('heading', { name: '위치 권한', exact: true }).isVisible());
      await page.route('**/api/public-data/pet-tour/places?**', route => route.fulfill({ json: { ok: true, data: { ...payload.data, empty: true, items: [], pagination: { ...payload.data.pagination, totalCount: 0, hasNextPage: false } } } }));
      await page.goto(base + '/pet-travel');
      await page.getByRole('heading', { name: '조건에 맞는 후보를 찾지 못했습니다.' }).waitFor();
      await page.route('**/api/public-data/pet-tour/places?**', route => route.fulfill({ status: 503, json: { ok: false, error: { message: 'Test API unavailable' } } }));
      await page.reload();
      await page.getByRole('heading', { name: '공공데이터를 불러오지 못했습니다.' }).waitFor();
      assert.equal(requests.some(url => /pagead2|doubleclick/.test(url)), false);
      assert.deepEqual(errors, []);
      reports.push({ width, overflow: false, consentCancel: 'PASS', consentAccept: 'PASS', sharing: 'PASS', keyboardPrivacyLink: 'PASS', emptyAndError: 'PASS', runtimeErrors: errors.length });
      await context.close();
    }
    console.log(JSON.stringify({ httpSeoAdsApi: 'PASS', browser: reports, screenshots }, null, 2));
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

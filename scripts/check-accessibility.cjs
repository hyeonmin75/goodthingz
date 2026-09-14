const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8790';
async function main() {
  const browser = await chromium.launch({ headless: true, channel: process.env.AUDIT_BROWSER_CHANNEL || undefined });
  const reports = [];
  try {
    for (const width of [360, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      await page.route('https://www.openstreetmap.org/**', r => r.fulfill({ contentType: 'text/html', body: '<html lang="ko"><title>시험 지도</title><body><main>시험 지도</main></body></html>' }));
      for (const route of ['/', '/pet-travel', '/pet-travel/guides', '/pet-travel/plan', '/privacy', '/about', '/data-sources/kto-pet-tour', '/pet-travel/guides/visit-checklist']) {
        await page.goto(base + route);
        await page.locator('footer').waitFor();
        if (route.endsWith('/plan')) {
          await page.getByLabel('직접 후보 이름 입력').fill('접근성 시험 후보');
          await page.getByRole('button', { name: '후보 추가', exact: true }).click();
        }
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
        const result = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
        const violations = result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
        reports.push({ route, width, violations });
        await page.screenshot({ path: path.resolve('.wrangler/policy-audit', `${width}-${route.replace(/\W/g, '') || 'home'}-viewport.png`) });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Overflow');
      }
      await page.goto(base + '/pet-travel/plan');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.skip-link').evaluate(e => e === document.activeElement), true);
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#main-content').evaluate(e => e === document.activeElement), true);
      await page.close();
    }
    console.log(JSON.stringify(reports, null, 2));
    assert.ok(reports.every(r => r.violations.length === 0), 'Accessibility violations');
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });

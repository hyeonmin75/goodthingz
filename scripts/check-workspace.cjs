const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8790';

async function main() {
  const { emptyPlan, PLAN_KEY, planReviewSummary, planReviewTasks, planComparisonCsv } = await import('../app/plan.ts');
  const plan = { ...emptyPlan(), date: '2026-10-02', costs: ['876543', '', '', '', ''], stops: [
    { id: 'a', title: '산책 후보', address: '공개 장소 주소 A', checks: ['confirmed', 'confirmed', 'confirmed', 'confirmed'], note: 'PRIVATE-MEMO' },
    { id: 'b', title: '숙박 후보', address: '공개 장소 주소 B', checks: ['unknown', 'unknown', 'unknown', 'unknown'], note: '' },
    { id: 'c', title: '식사 후보', address: '공개 장소 주소 C', checks: ['blocked', 'confirmed', 'unknown', 'unknown'], note: '' },
  ] };
  assert.deepEqual(planReviewSummary(plan), { total: 12, confirmed: 5, unknown: 6, blocked: 1, completedStops: 1 });
  assert.deepEqual(planReviewSummary(emptyPlan()), { total: 0, confirmed: 0, unknown: 0, blocked: 0, completedStops: 0 });
  assert.equal(planReviewTasks(plan).length, 7);
  assert.equal(planReviewTasks(plan)[0].status, 'blocked');
  const csv = planComparisonCsv(plan);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.equal(csv.split('\r\n').filter(Boolean).length, 4);
  assert.doesNotMatch(csv, /PRIVATE-MEMO|876543|2026-10-02/);
  for (const title of ['=1+1', '+cmd', '-cmd', '@SUM(A1)', '  =2', '\t=2']) {
    assert.ok(planComparisonCsv({ ...plan, stops: [{ ...plan.stops[0], title }] }).includes(`"'${title}"`));
  }
  assert.ok(planComparisonCsv({ ...plan, stops: [{ ...plan.stops[0], title: '쉼표,와 "따옴표"' }] }).includes('"쉼표,와 ""따옴표"""'));
  fs.mkdirSync('.wrangler/workspace-audit', { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.AUDIT_BROWSER_CHANNEL || undefined });
  const results = [];
  try {
    for (const width of [360, 768, 1280, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: width < 768 ? 844 : 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route(/googlesyndication|doubleclick/, r => r.fulfill({ contentType: 'application/javascript', body: '' }));
      await page.goto(base + '/');
      await page.locator('.home-hero-image').evaluate(img => img.decode());
      assert.ok(await page.locator('.home-hero-image').evaluate(img => img.naturalWidth > 0 && img.currentSrc.includes('/illustrations/pet-travel-studio-')));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.ok((await page.locator('.purpose-nav').boundingBox()).y < page.viewportSize().height, 'Next section must appear in first viewport');
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const homeAxe = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
      assert.deepEqual(homeAxe.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), []);
      await page.screenshot({ path: `.wrangler/workspace-audit/${width}-home.png` });
      if (width === 360) {
        await page.getByLabel('장소 유형', { exact: true }).selectOption('32');
        await page.getByLabel('어떤 장소를 찾으세요?').fill('여수');
        await page.getByRole('button', { name: '검색', exact: true }).click();
        await page.waitForURL(url => url.pathname === '/pet-travel' && url.searchParams.get('contentTypeId') === '32' && url.searchParams.get('keyword') === '여수');
        assert.equal(await page.locator('.search-form select').inputValue(), '32');
      }
      await page.evaluate(({ key, plan }) => localStorage.setItem(key, JSON.stringify(plan)), { key: PLAN_KEY, plan });
      await page.goto(base + '/pet-travel/plan');
      await page.locator('.plan-stop').nth(2).waitFor();
      await page.screenshot({ path: `.wrangler/workspace-audit/${width}-plan.png` });
      assert.deepEqual(await page.locator('.review-metrics dd').allTextContents(), ['5개 항목', '6개 항목', '1개 항목']);
      assert.equal(await page.locator('.review-tasks li').count(), 7);
      assert.match(await page.locator('.review-tasks li').first().innerText(), /조건 불일치/);
      await page.getByLabel('확인 항목', { exact: true }).selectOption('unknown');
      assert.equal(await page.locator('.review-tasks li').count(), 6);
      await page.getByLabel('확인 항목', { exact: true }).selectOption('blocked');
      assert.equal(await page.locator('.review-tasks li').count(), 1);
      await page.locator('.review-tasks button').first().click();
      assert.equal(await page.evaluate(() => document.activeElement.id), 'stop-check-2-0');
      await page.locator('#stop-check-2-0').selectOption('confirmed');
      assert.equal(await page.locator('.review-tasks li').count(), 0);
      assert.match(await page.locator('.plan-save-state').innerText(), /저장하지 않은 변경이 있습니다/);
      page.once('dialog', dialog => dialog.dismiss());
      await page.locator('.top-nav a[href="/pet-travel/guides"]').click();
      await page.waitForTimeout(100);
      assert.equal(new URL(page.url()).pathname, '/pet-travel/plan');
      await page.getByRole('button', { name: '이 기기에 저장', exact: true }).click();
      assert.match(await page.locator('.plan-save-state').innerText(), /변경 없음/);
      await page.reload();
      await page.locator('.plan-stop').nth(2).waitFor();
      assert.deepEqual(await page.locator('.review-metrics dd').allTextContents(), ['6개 항목', '6개 항목', '0개 항목']);
      await page.getByRole('tab', { name: '확인할 일', exact: true }).focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.getByRole('tab', { name: '후보 비교표', exact: true }).getAttribute('aria-selected'), 'true');
      assert.equal(await page.locator('.review-table tbody tr').count(), 4);
      const comparisonButton = page.locator('.review-table tbody tr').first().getByRole('button', { name: /숙박 후보/ });
      await comparisonButton.click();
      assert.equal(await page.evaluate(() => document.activeElement.id), 'stop-check-1-0');
      await page.locator('#stop-check-1-0').selectOption('blocked');
      assert.match(await comparisonButton.innerText(), /조건 불일치/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: '비교표 내려받기 (CSV)', exact: true }).click();
      const download = await downloadPromise;
      assert.equal(download.suggestedFilename(), 'goodthingz-place-comparison.csv');
      const downloaded = fs.readFileSync(await download.path(), 'utf8');
      assert.doesNotMatch(downloaded, /PRIVATE-MEMO|876543|2026-10-02/);
      assert.match(downloaded, /조건 불일치/);
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const axeResult = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
      assert.deepEqual(axeResult.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), []);
      await page.locator('.review-board').screenshot({ path: `.wrangler/workspace-audit/${width}-board.png` });
      await page.getByRole('tab', { name: '확인할 일', exact: true }).click();
      await page.locator('.review-board').screenshot({ path: `.wrangler/workspace-audit/${width}-tasks.png` });
      await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage disabled', 'QuotaExceededError'); }; });
      await page.getByRole('button', { name: '이 기기에 저장', exact: true }).click();
      assert.match(await page.locator('.plan-status').innerText(), /기기 저장을 사용할 수 없습니다/);
      assert.match(await page.locator('.plan-save-state').innerText(), /저장하지 않은 변경이 있습니다/);
      if (width === 360) {
        const dialogPromise = page.waitForEvent('dialog');
        const reload = page.reload().catch(() => null);
        const dialog = await dialogPromise;
        assert.equal(dialog.type(), 'beforeunload');
        await dialog.dismiss();
        await reload;
        assert.match(await page.locator('.plan-save-state').innerText(), /저장하지 않은 변경이 있습니다/);
      }
      page.once('dialog', dialog => dialog.accept());
      await page.locator('.top-nav a[href="/pet-travel/guides"]').click();
      await page.waitForURL('**/pet-travel/guides');
      assert.deepEqual(errors, []);
      results.push({ width, generatedAsset: 'PASS', search: width === 360 ? 'PASS' : 'layout PASS', reviewTasks: 'PASS', comparison: 'PASS', csvPrivacy: 'PASS', unsavedProtection: 'PASS', hardReloadProtection: width === 360 ? 'PASS' : 'not repeated', storageFailure: 'PASS', accessibility: 'PASS', runtimeErrors: errors.length });
      await page.close();
    }
  } finally { await browser.close(); }
  console.log(JSON.stringify({ summaryUnits: 'PASS', csvInjectionAndPrivacy: 'PASS', results }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8790';

async function main() {
  const { emptyPlan, parsePlan, costSummary, planShareText } = await import('../app/plan.ts');
  const { TRAVEL_GUIDES } = await import('../app/content/travel-guides.ts');
  assert.equal(TRAVEL_GUIDES.length, 10);
  assert.equal(new Set(TRAVEL_GUIDES.map(g => g.id)).size, 10);
  for (const guide of TRAVEL_GUIDES) {
    assert.equal(guide.steps.length, 3);
    assert.equal(guide.asks.length, 2);
    assert.ok(guide.limit && guide.data && guide.example.decision);
  }
  const plan = emptyPlan();
  assert.deepEqual(parsePlan(plan), plan);
  for (const invalid of [null, {}, { ...plan, version: 2 }, { ...plan, costs: ['-1', '', '', '', ''] }, { ...plan, stops: [{ id: 'bad' }] }, { ...plan, date: '2026-02-31' }]) assert.equal(parsePlan(invalid), null);
  assert.deepEqual(costSummary(['80000', '20000', '5000', '', '30000']), { known: 105000, missing: 1, deposit: 30000 });
  assert.deepEqual(costSummary(['', '', '', '', '']), { known: 0, missing: 4, deposit: null });
  assert.deepEqual(costSummary(['0', '0', '0', '0', '0']), { known: 0, missing: 0, deposit: 0 });
  const privatePlan = { ...plan, date: '2026-10-01', costs: ['876543', '', '', '', ''], stops: [{ id: 'private', title: '시험 후보', address: '시험 장소 주소', checks: ['unknown', 'confirmed', 'blocked', 'unknown'], note: 'PRIVATE-NOTE' }] };
  assert.doesNotMatch(planShareText(privatePlan), /PRIVATE-NOTE|876543/);
  assert.match(planShareText(privatePlan), /조건 불일치/);
  const browser = await chromium.launch({ headless: true, channel: process.env.AUDIT_BROWSER_CHANNEL || undefined });
  const screenshotDir = path.resolve('.wrangler/policy-audit');
  fs.mkdirSync(screenshotDir, { recursive: true });
  const results = [];
  try {
    for (const width of [360, 390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 844 } });
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'share', { value: async data => { window.__share = data; } });
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.__copy = text; } } });
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(base + '/pet-travel/guides');
      await page.locator('.decision-article').nth(9).waitFor();
      assert.equal(await page.locator('.decision-article').count(), 10);
      await page.locator('#dining').getByRole('button', { name: '문의 문장 복사' }).click();
      assert.match(await page.evaluate(() => window.__copy), /실내/);
      await page.goto(base + '/pet-travel/plan');
      await page.getByLabel('직접 후보 이름 입력').fill('긴 이름을 가진 시험 후보와 함께하는 방문 계획');
      await page.getByRole('button', { name: '후보 추가', exact: true }).click();
      const stop = page.locator('.plan-stop').first();
      await stop.getByLabel('확인 날짜·답변 메모').fill('PRIVATE-NOTE');
      await stop.getByLabel('동물·체중·마릿수').selectOption('confirmed');
      await stop.getByLabel('동반 구역·준비물').selectOption('blocked');
      await page.getByLabel('방문 예정일', { exact: true }).fill('2026-10-01');
      const costs = page.locator('.budget-inputs input');
      for (const [i, value] of ['80000', '20000', '5000', '', '30000'].entries()) await costs.nth(i).fill(value);
      assert.match(await page.locator('.budget-result').innerText(), /105,000원/);
      assert.match(await page.locator('.budget-result').innerText(), /135,000원/);
      assert.match(await page.locator('.budget-result').innerText(), /1개 항목/);
      await page.getByRole('button', { name: '이 기기에 저장', exact: true }).click();
      await page.reload();
      await page.locator('.plan-stop').waitFor();
      assert.equal(await page.getByLabel('확인 날짜·답변 메모').inputValue(), 'PRIVATE-NOTE');
      await page.getByRole('button', { name: '공유 미리보기' }).click();
      assert.doesNotMatch(await page.getByLabel('공유 내용 미리보기').inputValue(), /PRIVATE-NOTE|105,000|2026-10-01/);
      await page.getByRole('button', { name: '이 내용 공유' }).click();
      assert.match(await page.evaluate(() => window.__share.text), /조건 불일치/);
      await page.getByLabel('방문 예정일 포함').check();
      assert.match(await page.getByLabel('공유 내용 미리보기').inputValue(), /2026-10-01/);
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: '계획 파일 내려받기' }).click();
      const download = await downloadPromise;
      const downloaded = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
      assert.ok(parsePlan(downloaded));
      assert.equal(downloaded.stops[0].note, 'PRIVATE-NOTE');
      await page.locator('input[type=file]').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{"version":99}') });
      await page.getByRole('status').filter({ hasText: '이 계획 파일을 읽을 수 없습니다.' }).waitFor();
      page.once('dialog', d => d.accept());
      await page.locator('input[type=file]').setInputFiles({ name: 'plan.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(privatePlan)) });
      await page.getByRole('heading', { name: '시험 후보', exact: true }).waitFor();
      await page.getByLabel('직접 후보 이름 입력').fill('두 번째 후보');
      await page.getByRole('button', { name: '후보 추가', exact: true }).click();
      await page.getByRole('button', { name: '두 번째 후보 순서 위로', exact: true }).click();
      assert.equal(await page.locator('.plan-stop h3').first().innerText(), '두 번째 후보');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(screenshotDir, `${width}-plan-filled.png`), fullPage: true });
      page.once('dialog', d => d.accept());
      await page.getByRole('button', { name: '계획 전체 삭제' }).click();
      assert.equal(await page.locator('.plan-stop').count(), 0);
      assert.equal(await page.evaluate(() => localStorage.getItem('goodthingz.visitPlan.v1')), null);
      assert.deepEqual(errors, []);
      results.push({ width, saveReload: 'PASS', privacyShare: 'PASS', budget: 'PASS', fileRoundTripAndInvalid: 'PASS', reorderDelete: 'PASS', overflow: false });
      await context.close();
    }
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const page = await noJs.newPage();
    await page.goto(base + '/pet-travel');
    assert.ok(await page.locator('.place-card').count() > 0);
    await page.goto(base + '/pet-travel/guides');
    assert.equal(await page.locator('.decision-article').count(), 10);
    await noJs.close();
    console.log(JSON.stringify({ unit: 'PASS', guides: TRAVEL_GUIDES.length, guideTextCharacters: TRAVEL_GUIDES.reduce((n, g) => n + JSON.stringify(g).length, 0), noJavaScriptSSR: 'PASS', browser: results }, null, 2));
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8790';
const sample = require('../app/content/pet-study-sample.json');

async function main() {
  const { calculatePetFee, placeQuestions } = await import('../app/decision-tools.ts');
  assert.deepEqual(calculatePetFee('20000', '2', '3', 'pet-night'), { multiplier: 6, total: 120000 });
  assert.equal(calculatePetFee('20000', '2', '3', 'pet').total, 40000);
  assert.equal(calculatePetFee('20000', '2', '3', 'night').total, 60000);
  assert.equal(calculatePetFee('20000', '', '', 'visit').total, 20000);
  assert.equal(calculatePetFee('0', '1', '1', 'pet-night').total, 0);
  for (const amount of ['', '-1', '1.2', '1e3', '100000000']) assert.equal(calculatePetFee(amount, '1', '1', 'pet-night'), null);
  for (const count of ['', '0', '21', '-2', '1.5']) assert.equal(calculatePetFee('100', count, '1', 'pet-night'), null);
  for (const nights of ['', '0', '31', '1.5']) assert.equal(calculatePetFee('100', '1', nights, 'pet-night'), null);
  const sparse = { petPolicy: { allowedPets: '안내견', companionshipType: null, requiredItems: null }, visitInfo: { hours: null, checkInOut: null, fee: null, parking: null } };
  const questions = placeQuestions(sparse);
  assert.equal(questions.length, 6);
  assert.equal(questions[0].evidence, '안내견');
  assert.equal(questions[4].evidence, null);
  assert.equal(sample.records.length, 12);
  assert.equal(new Set(sample.records.map(record => record.id)).size, 12);
  for (const type of ['12', '14', '32', '39']) assert.equal(sample.records.filter(record => record.typeId === type).length, 3);
  const browser = await chromium.launch({ headless: true, channel: process.env.AUDIT_BROWSER_CHANNEL || undefined });
  const reports = [];
  fs.mkdirSync('.wrangler/value-audit', { recursive: true });
  try {
    for (const width of [360, 768, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('https://pagead2.googlesyndication.com/**', r => r.fulfill({ contentType: 'application/javascript', body: '' }));
      await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.__copied = text; } } }));
      for (const route of ['/', '/pet-travel/data-notes', '/pet-travel/guides']) {
        const response = await page.goto(base + route);
        assert.equal(response.status(), 200);
        assert.equal(await page.locator('h1').count(), 1);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} ${route} overflow`);
        const broken = await page.evaluate(() => [...document.querySelectorAll('a[href]')].filter(a => {
          const url = new URL(a.href);
          return url.origin === location.origin && url.pathname === location.pathname && url.hash && !document.getElementById(decodeURIComponent(url.hash.slice(1)));
        }).map(a => a.getAttribute('href')));
        assert.deepEqual(broken, [], `Broken anchors on ${route}`);
        if (route.endsWith('data-notes')) {
          assert.equal(await page.locator('.study-record').count(), 12);
          assert.equal(await page.locator('.study-comparison').count(), 3);
          for (const record of sample.records) assert.ok(await page.locator(`#record-${record.id}`).innerText());
          assert.match(await page.locator('#record-2524188 .study-evidence').innerText(), /상시 개방/);
          assert.match(await page.locator('#method').innerText(), /무작위 표본이나 지역별 대표 표본이 아닙니다/);
          assert.match(await page.locator('.study-findings').innerText(), /전국 비율·인기·품질 순위가 아니며/);
          const stats = await page.locator('.finding strong').allTextContents();
          assert.deepEqual(stats, ['6', '1', '2']);
          for (const photo of await page.locator('.study-photo img').all()) {
            await photo.scrollIntoViewIfNeeded();
            await photo.evaluate(img => img.decode());
            assert.ok(await photo.evaluate(img => img.naturalWidth > 0 && getComputedStyle(img).objectFit === 'contain'), 'Licensed photograph must load without cropping');
          }
          await page.locator('#indoor').screenshot({ path: `.wrangler/value-audit/${width}-comparison.png` });
          await page.locator('#record-129894').screenshot({ path: `.wrangler/value-audit/${width}-case.png` });
          await page.evaluate(() => scrollTo(0, 0));
          await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
          const axe = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
          assert.deepEqual(axe.violations.map(v => v.id), []);
        }
        await page.screenshot({ path: `.wrangler/value-audit/${width}-${route.replace(/\W/g, '') || 'home'}.png`, fullPage: false });
      }
      await page.getByLabel('지금 준비하는 것').selectOption('planning');
      assert.equal(await page.locator('.guide-summary').count(), 6);
      await page.locator('#budget h3 a').click();
      await page.waitForURL('**/pet-travel/guides/budget');
      await page.locator('.decision-article').waitFor();
      assert.equal(await page.locator('.decision-article').count(), 1);
      await page.getByLabel('확인한 단가 (원)').fill('20000');
      await page.getByLabel('반려동물 수', { exact: true }).fill('2');
      await page.getByLabel('숙박일 수 (박)').fill('3');
      assert.match(await page.locator('.fee-result').innerText(), /120,000원/);
      await page.getByLabel('요금 기준').selectOption('visit');
      assert.match(await page.locator('.fee-result').innerText(), /20,000원/);
      await page.getByLabel('확인한 단가 (원)').fill('');
      assert.match(await page.locator('.fee-result').innerText(), /미확인/);
      await page.locator('.fee-calculator').screenshot({ path: `.wrangler/value-audit/${width}-fee.png` });
      await page.goto(base + '/pet-travel/guides');
      assert.equal(await page.locator('.guide-summary').count(), 36);
      await page.goto(base + '/pet-travel');
      if (width < 768) await page.getByRole('button', { name: '지도와 상세', exact: true }).click();
      await page.locator('.place-enquiry summary').click();
      await page.locator('.place-enquiry').getByLabel('한 마리 체중 (kg)').fill('8');
      await page.locator('.place-enquiry').getByLabel('마릿수', { exact: true }).fill('2');
      await page.locator('.place-enquiry').getByLabel('희망 구역').selectOption('실내 좌석');
      await page.getByRole('button', { name: '선택한 질문 복사', exact: true }).click();
      const copied = await page.evaluate(() => window.__copied);
      assert.match(copied, /8kg/); assert.match(copied, /2마리/); assert.match(copied, /실내 좌석/);
      assert.match(copied, /1\./); assert.match(copied, /6\./);
      assert.doesNotMatch(copied, /허용됨|입장 확정|serviceKey|PUBLIC_DATA_API_KEY/);
      await page.locator('.place-enquiry').getByLabel('마릿수', { exact: true }).fill('1.5');
      assert.match(await page.getByLabel('문의 초안').inputValue(), /마릿수 미정/);
      await page.locator('.place-enquiry').getByLabel('마릿수', { exact: true }).fill('2');
      const storage = await page.evaluate(() => JSON.stringify(localStorage));
      assert.doesNotMatch(storage, /8kg|실내 좌석/);
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const axe = await page.evaluate(() => window.axe.run(document.querySelector('.place-enquiry'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
      assert.deepEqual(axe.violations.map(v => v.id), []);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('.place-enquiry').screenshot({ path: `.wrangler/value-audit/${width}-enquiry.png` });
      assert.deepEqual(errors, []);
      reports.push({ width, evidence: 'PASS', feeCalculation: 'PASS', enquiries: 'PASS', accessibility: 'PASS', runtimeErrors: errors.length });
      await page.close();
    }
  } finally { await browser.close(); }
  console.log(JSON.stringify({ calculationEdgeCases: 'PASS', sampleIntegrity: 'PASS', reports }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

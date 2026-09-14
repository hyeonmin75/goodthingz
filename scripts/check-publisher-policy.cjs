const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8790';

async function main() {
  const indexPaths = ['/', '/pet-travel', '/about', '/privacy', '/data-sources/kto-pet-tour', '/pet-travel/guides/visit-checklist', '/pet-travel/guides'];
  const titles = new Set();
  for (const route of indexPaths) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, route);
    assert.match(html, /google-adsense-account/);
    assert.match(html, /href="\/privacy"/);
    assert.doesNotMatch(html, /<script[^>]+src="https:\/\/pagead2/);
    assert.match(html, /rel="canonical"/);
    assert.match(html, /name="description" content="[^"]+"/);
    assert.match(html, /property="og:title"/);
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(!titles.has(title), 'Unique page title');
    titles.add(title);
    assert.ok(html.includes(`href="https://goodthingfor.com${route}"`), 'Canonical URL');
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
    if (route === '/') {
      assert.match(html, /내 여행에서 놓치기 쉬운 질문/);
      assert.equal((html.match(/class="home-guide"/g) || []).length, 10);
      assert.ok((html.match(/class="home-place"/g) || []).length > 0, 'Real candidates in SSR HTML');
      assert.doesNotMatch(html, /반려견 핫플/);
    }
    if (route === '/pet-travel') assert.ok((html.match(/class="place-card[ "]/g) || []).length > 0, 'Search results in SSR HTML');
    if (route === '/pet-travel/guides') assert.equal((html.match(/class="decision-article"/g) || []).length, 10);
    if (route.endsWith('visit-checklist')) {
      assert.match(html, /방문 전 확인 항목/);
      assert.match(html, /"datePublished":"2026-08-31"/);
    }
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
  assert.match(await (await fetch(base + '/pet-travel/plan')).text(), /noindex,follow/);
  const sitemap = await (await fetch(base + '/sitemap.xml')).text();
  assert.equal((sitemap.match(/<loc>/g) || []).length, indexPaths.length);
  assert.doesNotMatch(sitemap, /\/search|\/compare|\/places\/|\/plan</);
  assert.equal((await (await fetch(base + '/ads.txt')).text()).trim(), 'google.com, pub-1998974659917167, DIRECT, f08c47fec0942fa0');
  const robots = await (await fetch(base + '/robots.txt')).text();
  assert.match(robots, /Allow: \/\n/);
  assert.match(robots, /Sitemap: https:\/\/goodthingfor.com\/sitemap.xml/);
  assert.doesNotMatch(robots, /Disallow: \/(ads.txt|$)/m);
  const api = await fetch(base + '/api/public-data/pet-tour/places?page=1&pageSize=3');
  assert.equal(api.status, 200);
  const payload = await api.json();
  assert.equal(payload.ok, true);
  assert.ok(payload.data.items.length > 0);
  const first = payload.data.items[0];
  const detailResponse = await fetch(base + '/api/public-data/pet-tour/place?' + new URLSearchParams({ contentId: first.source.contentId, contentTypeId: first.contentTypeId }));
  assert.equal(detailResponse.status, 200);
  const realDetail = await detailResponse.json();
  assert.equal(realDetail.ok, true);
  assert.doesNotMatch(JSON.stringify(realDetail), /PUBLIC_DATA_API_KEY|serviceKey/i);
  assert.doesNotMatch(JSON.stringify(payload), /PUBLIC_DATA_API_KEY|serviceKey/i);
  assert.equal((await fetch(base + '/api/public-data/pet-tour/places?page=-1')).status, 400);
  assert.equal((await fetch(base + '/api/public-data/pet-tour/places', { method: 'POST' })).status, 405);
  assert.equal((await fetch(base + '/api/public-data/pet-tour/places?latitude=999&longitude=126')).status, 400);
  const pageTwo = await (await fetch(base + '/api/public-data/pet-tour/places?page=2&pageSize=3')).json();
  assert.equal(pageTwo.ok, true);
  assert.equal(pageTwo.data.pagination.page, 2);
  const nearby = await (await fetch(base + '/api/public-data/pet-tour/places?latitude=37.5665&longitude=126.978&radius=1000&pageSize=3')).json();
  assert.equal(nearby.ok, true);
  assert.equal(nearby.data.source.operation, 'locationBasedList2');
  for (const place of nearby.data.items) assert.ok(place.location.distanceMeters === null || place.location.distanceMeters <= 1000);
  const browser = await chromium.launch({ headless: true, channel: process.env.AUDIT_BROWSER_CHANNEL || undefined });
  const reports = [];
  const screenshots = path.resolve('.wrangler/policy-audit');
  fs.mkdirSync(screenshots, { recursive: true });
  try {
    for (const width of [360, 390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 844 } });
      // Synthetic position only. No device location or live location request is used.
      await context.addInitScript(() => {
        window.__locationCalls = 0;
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.__copiedText = text; } } });
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
      for (const route of ['/', '/privacy', '/about', '/data-sources/kto-pet-tour', '/pet-travel/guides/visit-checklist', '/pet-travel/guides', '/pet-travel/plan', '/pet-travel']) {
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
      const mapSource = await page.locator('iframe').first().getAttribute('src');
      assert.match(decodeURIComponent(mapSource), /marker=37.5665,126.978/);
      const radiusRequest = page.waitForRequest(r => new URL(r.url()).searchParams.get('radius') === '1000');
      await page.getByRole('button', { name: '1km', exact: true }).click();
      await radiusRequest;
      if (width < 768) await page.getByRole('button', { name: '목록', exact: true }).click();
      await page.locator('.place-card').first().getByRole('button', { name: '저장', exact: true }).click();
      if (width < 768) await page.getByRole('button', { name: '지도와 상세', exact: true }).click();
      await page.locator('.saved-panel').getByRole('button', { name: '공유', exact: true }).click();
      const shared = await page.evaluate(() => window.__sharedData.text);
      assert.match(shared, /https:\/\/goodthingfor.com\/pet-travel/);
      assert.doesNotMatch(shared, /37\.5665|126\.978|거리 정보|\d+(\.\d+)?km/);
      const privacyLink = page.locator('footer').getByRole('link', { name: '개인정보 처리 안내', exact: true });
      await privacyLink.focus();
      await page.keyboard.press('Enter');
      await page.waitForURL('**/privacy');
      assert.ok(await page.getByRole('heading', { name: '위치 권한', exact: true }).isVisible());
      await page.goto(base + '/');
      assert.equal(await page.locator('.home-guide').count(), 10);
      await page.getByLabel('어떤 장소를 찾으세요?').fill('강릉');
      await page.getByRole('button', { name: '검색', exact: true }).click();
      await page.waitForURL(url => url.pathname === '/pet-travel' && url.searchParams.get('keyword') === '강릉');
      assert.equal(await page.getByLabel('장소명 또는 목적', { exact: true }).inputValue(), '강릉');
      await page.goto(base + '/pet-travel/guides#overnight');
      await page.locator('#overnight').getByRole('link', { name: '숙박 후보 찾기' }).click();
      await page.waitForURL('**/pet-travel?contentTypeId=32');
      assert.equal(await page.locator('.search-form select').inputValue(), '32');
      await page.goto(base + '/pet-travel/guides/visit-checklist');
      const planner = page.locator('#visit-planner');
      await planner.getByRole('checkbox').first().check();
      assert.match(await planner.innerText(), /직접 확인한 항목 1 \/ 6/);
      await page.getByLabel('어떤 장소에 문의하나요?').selectOption('stay');
      await page.getByRole('button', { name: '문의 문장 복사', exact: true }).click();
      assert.match(await page.evaluate(() => window.__copiedText), /객실/);
      await page.getByRole('button', { name: '체크 초기화', exact: true }).click();
      assert.match(await planner.innerText(), /직접 확인한 항목 0 \/ 6/);
      await planner.screenshot({ path: path.join(screenshots, `${width}-planner.png`) });
      // Deliberately incomplete fixture: a facility field must not imply verified entry.
      await page.route('**/api/public-data/pet-tour/place?**', route => {
        const id = new URL(route.request().url()).searchParams.get('contentId');
        const item = payload.data.items.find(item => item.source.contentId === id) || first;
        return route.fulfill({ json: { ok: true, data: {
          ...realDetail.data, id: item.id, title: item.title, images: [], overview: null,
          petPolicy: { ...Object.fromEntries(Object.keys(realDetail.data.petPolicy).map(key => [key, null])), hasPetPolicy: true, facilities: '동반 시설 안내만 존재하는 시험 자료' },
          visitInfo: { ...realDetail.data.visitInfo, hours: '09:00~18:00 (시험 자료)', parking: null },
        } } });
      });
      await page.goto(base + '/pet-travel');
      await page.locator('.place-card').first().waitFor();
      if (width < 768) await page.getByRole('button', { name: '지도와 상세', exact: true }).click();
      await page.locator('.evidence-summary').waitFor();
      assert.match(await page.locator('.evidence-summary').innerText(), /동반 가능 동물/);
      assert.doesNotMatch(await page.locator('.detail-panel').innerText(), /동반 조건 확인됨/);
      await page.locator('.detail-panel').screenshot({ path: path.join(screenshots, `${width}-evidence.png`) });
      if (width < 768) await page.getByRole('button', { name: '목록', exact: true }).click();
      await page.locator('.place-card').nth(0).getByRole('button', { name: '루트 추가', exact: true }).click();
      await page.locator('.place-card').nth(1).getByRole('button', { name: '루트 추가', exact: true }).click();
      await page.locator('.compare-card').nth(1).getByText('09:00~18:00 (시험 자료)', { exact: true }).waitFor();
      assert.equal(await page.locator('.compare-card').count(), 2);
      assert.match(await page.locator('.compare-tray').innerText(), /별도 안내 없음/);
      await page.getByRole('link', { name: /선택한 2곳의 조건 비교 보기/ }).click();
      const comparisonTitle = page.getByRole('heading', { name: '2곳 선택됨' });
      await page.waitForFunction(() => {
        const element = document.querySelector('#compare-title');
        const r = element.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= innerHeight && element.contains(document.elementFromPoint(r.left + 5, r.top + r.height / 2));
      });
      assert.ok(await comparisonTitle.evaluate(element => { const r = element.getBoundingClientRect(); return element.contains(document.elementFromPoint(r.left + 5, r.top + r.height / 2)); }), 'Comparison heading is not obscured');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Comparison overflow');
      await page.locator('.compare-tray').screenshot({ path: path.join(screenshots, `${width}-comparison.png`) });
      await page.route('**/api/public-data/pet-tour/places?**', async route => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return route.fulfill({ json: { ok: true, data: { ...payload.data, empty: true, items: [], pagination: { ...payload.data.pagination, totalCount: 0, hasNextPage: false } } } });
      });
      await page.goto(base + '/pet-travel');
      await page.getByRole('button', { name: '검색', exact: true }).click();
      await page.locator('.skeleton-list').waitFor();
      await page.getByRole('heading', { name: '조건에 맞는 후보를 찾지 못했습니다.' }).waitFor();
      await page.route('**/api/public-data/pet-tour/places?**', route => route.fulfill({ status: 503, json: { ok: false, error: { message: 'Test API unavailable' } } }));
      await page.getByRole('button', { name: '다시 검색', exact: true }).click();
      await page.getByRole('heading', { name: '공공데이터를 불러오지 못했습니다.' }).waitFor();
      assert.equal(requests.some(url => /pagead2|doubleclick/.test(url)), false);
      assert.deepEqual(errors, []);
      reports.push({ width, overflow: false, consentCancel: 'PASS', consentAccept: 'PASS', sharing: 'PASS', keyboardPrivacyLink: 'PASS', emptyAndError: 'PASS', homeSearchAndType: 'PASS', checklistAndCopy: 'PASS', missingEvidenceAndComparison: 'PASS', runtimeErrors: errors.length });
      await context.close();
    }
    console.log(JSON.stringify({ httpSeoAdsApi: 'PASS', browser: reports, screenshots }, null, 2));
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

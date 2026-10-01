const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8790';

async function main() {
  const { TRAVEL_GUIDES: guides, GUIDE_CATEGORIES: categories, GUIDE_DETAILS: details, guidePath } = await import('../app/content/travel-guides.ts');
  const { GUIDE_READING: reading, guideArticleParagraphs, guideOfficialSources } = await import('../app/content/guide-reading.ts');
  const { CONTACT_EMAIL, OPERATOR_NAME, contactMailText } = await import('../app/site-info.ts');
  assert.equal(guides.length, 36);
  const ids = new Set(guides.map(guide => guide.id));
  assert.equal(ids.size, 36);
  assert.equal(new Set(guides.map(guide => guide.title)).size, 36);
  assert.equal(new Set(guides.map(guide => guide.question)).size, 36);
  assert.equal(categories.length, 6);
  assert.deepEqual(categories.flatMap(category => category.ids).sort(), [...ids].sort());
  assert.ok(categories.every(category => category.ids.length === 6));
  assert.deepEqual(Object.keys(details).sort(), [...ids].sort());
  assert.deepEqual(Object.keys(reading).sort(), [...ids].sort());
  let characters = 0;
  const articleLengths = [];
  const paragraphOwners = new Map();
  for (const guide of guides) {
    assert.match(guide.id, /^[a-z][a-z-]+$/);
    const detail = details[guide.id];
    assert.equal(guide.steps.length, 3);
    assert.equal(guide.asks.length, 2);
    assert.equal(detail.decisions.length, 3);
    assert.equal(new Set(detail.related).size, 3);
    assert.ok(detail.related.every(id => ids.has(id) && id !== guide.id));
    assert.equal(reading[guide.id].sections.length, 2);
    assert.ok(reading[guide.id].sections.every(section => section.title && section.paragraphs.length === 3));
    const paragraphs = guideArticleParagraphs(guide);
    for (const paragraph of paragraphs) {
      assert.ok(paragraph.length >= (guide.asks.includes(paragraph) ? 15 : paragraph === guide.example.situation ? 35 : 45), `Incomplete section: ${guide.id}`);
      assert.ok(paragraph.length <= 320, `Split this long paragraph: ${guide.id}`);
      assert.ok(!paragraphOwners.has(paragraph), `Duplicated editorial paragraph: ${guide.id} / ${paragraphOwners.get(paragraph)}`);
      paragraphOwners.set(paragraph, guide.id);
    }
    const text = paragraphs.join('');
    const count = text.replace(/\s/g, '').length;
    // User requirement. Excludes navigation, headings, sources, tables and shared notices.
    // Google does not prescribe this character threshold.
    assert.ok(count >= 1300, `${guide.id}: ${count} characters`);
    assert.doesNotMatch(text, /TODO|Lorem ipsum|승인 보장|전국 최저가/);
    const sources = guideOfficialSources(guide.id);
    assert.ok(sources.length >= 2);
    assert.equal(new Set(sources.map(source => source.url)).size, sources.length);
    const officialHosts = new Set(['www.data.go.kr', 'korean.visitkorea.or.kr', 'www.weather.go.kr', 'www.juso.go.kr', 'www.korail.com', 'www.animal.go.kr', 'privacy.kisa.or.kr']);
    assert.ok(sources.every(source => source.title.trim().length >= 5 && source.note && new URL(source.url).protocol === 'https:' && officialHosts.has(new URL(source.url).hostname)));
    characters += count;
    articleLengths.push({ id: guide.id, title: guide.title, proseCharactersWithoutWhitespace: count, officialSources: sources.map(source => source.url) });
  }
  assert.equal(CONTACT_EMAIL, 'goodthingz57775@gmail.com');
  assert.equal(OPERATOR_NAME, '굳띵즈');
  assert.match(contactMailText('privacy', '', '삭제 요청'), /개인정보 문의·삭제 요청/);
  const browser = await chromium.launch({ headless: true, channel: process.env.AUDIT_BROWSER_CHANNEL || undefined });
  fs.mkdirSync('.wrangler/editorial-audit', { recursive: true });
  const reports = [];
  try {
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    await noJs.route('**/*', route => ['image', 'font', 'stylesheet', 'script'].includes(route.request().resourceType()) ? route.abort() : route.continue());
    const reader = await noJs.newPage();
    for (const guide of guides) {
      const response = await reader.goto(base + guidePath(guide.id), { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200);
      assert.equal(await reader.locator('h1').innerText(), guide.title);
      assert.equal(await reader.locator('.decision-steps li').count(), 3);
      assert.equal(await reader.locator('.article-table-wrap tbody tr').count(), 3);
      assert.equal(await reader.locator('.related-guide').count(), 3);
      assert.equal(await reader.locator('.guide-reading-section').count(), 2);
      const renderedParagraphs = await reader.locator('[data-article-prose]').allTextContents();
      const expectedParagraphs = guideArticleParagraphs(guide);
      assert.deepEqual([...renderedParagraphs].sort(), [...expectedParagraphs].sort(), `SSR prose: ${guide.id}`);
      assert.ok(renderedParagraphs.join('').replace(/\s/g, '').length >= 1300, `SSR length: ${guide.id}`);
      const sourceHrefs = await reader.locator('.official-sources a').evaluateAll(links => links.map(link => link.href));
      assert.deepEqual(sourceHrefs, guideOfficialSources(guide.id).map(source => source.url));
      const sequence = categories.flatMap(category => category.ids);
      const position = sequence.indexOf(guide.id);
      for (const [rel, id] of [['prev', sequence[position - 1]], ['next', sequence[position + 1]]]) {
        const link = reader.locator(`.guide-sequence a[rel=${rel}]`);
        assert.equal(await link.count(), id ? 1 : 0);
        if (id) assert.equal(await link.getAttribute('href'), guidePath(id));
      }
      assert.equal(await reader.locator('link[rel=canonical]').getAttribute('href'), 'https://goodthingfor.com' + guidePath(guide.id));
      const body = await reader.locator('.guide-body').innerText();
      for (const text of [guide.intro, guide.example.decision, reading[guide.id].answer]) assert.ok(body.includes(text), guide.id);
      const schema = await reader.locator('script[type="application/ld+json"]').allTextContents();
      assert.ok(schema.some(text => JSON.stringify(JSON.parse(text)).includes('"@type":"Article"')));
      const articleSchema = schema.flatMap(text => JSON.parse(text)).find(item => item['@type'] === 'Article');
      assert.deepEqual(articleSchema.citation, sourceHrefs);
    }
    await reader.goto(base + '/pet-travel/data-notes', { waitUntil: 'domcontentloaded' });
    assert.doesNotMatch(await reader.locator('main').innerText(), /최초 발행본|수집일을 보존합니다|수정 원칙/);
    assert.ok((await reader.locator('a[href="https://www.data.go.kr/data/15135102/openapi.do"]').count()) > 0);
    for (const route of ['/pet-travel/guides?category=stay', '/pet-travel/guides/size?keyword=test', '/contact?topic=privacy']) {
      const r = await reader.goto(base + route, { waitUntil: 'domcontentloaded' });
      assert.equal(r.status(), 200);
      assert.equal(await reader.locator('meta[name=robots]').getAttribute('content'), 'noindex,follow');
      assert.ok(!(await reader.locator('link[rel=canonical]').getAttribute('href')).includes('?'));
    }
    const missing = await reader.goto(base + '/pet-travel/guides/not-a-published-article', { waitUntil: 'domcontentloaded' });
    assert.equal(missing.status(), 404);
    assert.match(missing.headers()['x-robots-tag'], /noindex/);
    await noJs.close();
    for (const width of [360, 390, 768, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.route(/googlesyndication|doubleclick/, route => route.fulfill({ contentType: 'application/javascript', body: '' }));
      await context.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__copied = value; } } }));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const route of ['/', '/pet-travel/guides', '/pet-travel/guides/room-booking', '/pet-travel/data-notes', '/data-sources/kto-pet-tour', '/about', '/privacy', '/contact']) {
        assert.equal((await page.goto(base + route, { waitUntil: 'domcontentloaded' })).status(), 200);
        await page.locator('footer').waitFor();
        await page.evaluate(() => document.fonts.ready);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} ${route}: overflow`);
        assert.equal(await page.locator('h1').count(), 1);
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
        const results = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
        assert.deepEqual(results.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), [], `${width} ${route}`);
        await page.screenshot({ path: `.wrangler/editorial-audit/${width}-${route.replace(/\W/g, '') || 'home'}.png` });
        if (route.endsWith('/room-booking')) {
          for (const section of ['read-1', 'criteria', 'sources', 'related']) {
            await page.locator(`#${section}`).scrollIntoViewIfNeeded();
            await page.screenshot({ path: `.wrangler/editorial-audit/${width}-reading-${section}.png` });
          }
          const typography = await page.locator('.guide-reading-section p').first().evaluate(p => ({ font: getComputedStyle(p).fontSize, line: getComputedStyle(p).lineHeight }));
          assert.ok(parseFloat(typography.font) >= 16);
          assert.ok(parseFloat(typography.line) >= parseFloat(typography.font) * 1.7);
        }
      }
      await page.goto(base + '/pet-travel/guides');
      assert.equal(await page.locator('.guide-summary').count(), 36);
      await page.getByLabel('지금 준비하는 것').selectOption('stay');
      assert.equal(await page.locator('.guide-summary').count(), 6);
      await page.getByLabel('가이드 안에서 찾기').fill('조식');
      assert.ok(await page.locator('.guide-summary').count() > 0);
      await page.getByLabel('가이드 안에서 찾기').fill('없는결과xyz123');
      assert.equal(await page.locator('.guide-summary').count(), 0);
      await page.getByRole('button', { name: '조건 초기화' }).click();
      assert.equal(await page.locator('.guide-summary').count(), 36);
      await page.getByLabel('가이드 안에서 찾기').fill('없는결과xyz123');
      await page.locator('.topic-nav a[href="#category-arrival"]').click();
      assert.equal(await page.locator('.guide-summary').count(), 36);
      await page.waitForFunction(() => {
        const top = document.querySelector('#category-arrival').getBoundingClientRect().top;
        return top >= 0 && top < 120;
      }, null, { timeout: 5000 });
      const categoryTop = await page.locator('#category-arrival').evaluate(node => node.getBoundingClientRect().top);
      assert.ok(categoryTop >= 0 && categoryTop < 120, `Category anchor after empty results: ${categoryTop}`);
      await page.getByLabel('지금 준비하는 것').selectOption('dining');
      await page.locator('footer .footer-topics a[href$="#category-stay"]').click();
      await page.waitForURL(base + '/pet-travel/guides#category-stay');
      assert.equal(await page.locator('.guide-summary').count(), 36);
      await page.locator('#room-booking h3 a').click();
      await page.waitForURL('**/pet-travel/guides/room-booking');
      await page.getByRole('button', { name: '문의 문장 복사' }).focus();
      await page.keyboard.press('Enter');
      assert.match(await page.evaluate(() => window.__copied), /객실/);
      const nextHref = await page.locator('.guide-sequence a[rel=next]').getAttribute('href');
      await page.locator('.guide-sequence a[rel=next]').focus();
      await page.keyboard.press('Enter');
      await page.waitForURL(base + nextHref);
      await page.locator('.guide-sequence a[rel=prev]').click();
      await page.waitForURL('**/pet-travel/guides/room-booking');
      const relatedHref = await page.locator('.related-guide').first().getAttribute('href');
      await page.locator('.related-guide').first().click();
      await page.waitForURL(base + relatedHref);
      await page.getByRole('link', { name: '이 글의 오류·빠진 정보 알리기' }).click();
      await page.waitForURL(url => url.pathname === '/contact');
      assert.match(await page.getByLabel('관련 페이지').inputValue(), /https:\/\/goodthingfor.com\/pet-travel\/guides\//);
      const network = [];
      page.on('request', request => network.push({ url: request.url(), body: request.postData() || '' }));
      await page.getByLabel('문의 유형').selectOption('privacy');
      await page.getByLabel('문의 내용').fill('TEST-PRIVATE-EMAIL-DRAFT');
      const mailto = new URL(await page.getByRole('link', { name: '이메일 앱 열기' }).getAttribute('href'));
      assert.equal(mailto.protocol, 'mailto:');
      assert.equal(mailto.pathname, CONTACT_EMAIL);
      assert.match(mailto.searchParams.get('body'), /TEST-PRIVATE-EMAIL-DRAFT/);
      await page.getByRole('button', { name: '초안 복사' }).click();
      assert.match(await page.evaluate(() => window.__copied), /TEST-PRIVATE-EMAIL-DRAFT/);
      assert.ok(!JSON.stringify(network).includes('TEST-PRIVATE-EMAIL-DRAFT'), 'Contact draft must not be sent to a server');
      assert.ok(!await page.evaluate(() => JSON.stringify(localStorage).includes('TEST-PRIVATE-EMAIL-DRAFT')), 'Draft must not be persisted');
      await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Denied'); } } }));
      await page.getByRole('button', { name: '초안 복사' }).click();
      assert.match(await page.locator('.contact-composer [role=status]').innerText(), /자동 복사를 사용할 수 없습니다/);
      assert.deepEqual(errors, []);
      reports.push({ width, layoutAndA11y: 'PASS', catalogSearchAndEmpty: 'PASS', articleLinksAndCopy: 'PASS', privateContactDraftAndFallback: 'PASS', runtimeErrors: 0 });
      await context.close();
    }
    fs.writeFileSync('.wrangler/editorial-audit/article-lengths.json', JSON.stringify(articleLengths, null, 2));
    console.log(JSON.stringify({ articles: guides.length, categories: categories.length, relatedLinks: 108, previousNextLinks: 70, proseCharactersWithoutWhitespace: characters, minimumArticleCharacters: Math.min(...articleLengths.map(item => item.proseCharactersWithoutWhitespace)), maximumArticleCharacters: Math.max(...articleLengths.map(item => item.proseCharactersWithoutWhitespace)), allArticlesNoJavaScript: 'PASS', officialSourcesAndSequence: 'PASS', queryNoindexAnd404: 'PASS', reports }, null, 2));
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

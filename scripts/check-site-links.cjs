const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8790';

async function main() {
  const browser = await chromium.launch({ headless: true, channel: process.env.AUDIT_BROWSER_CHANNEL || undefined });
  try {
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.route('https://pagead2.googlesyndication.com/**', r => r.abort());
    await page.route('**/*', route => ['image', 'font', 'stylesheet', 'media'].includes(route.request().resourceType()) ? route.abort() : route.continue());
    const xml = await (await fetch(base + '/sitemap.xml')).text();
    const urls = await page.evaluate(text => [...new DOMParser().parseFromString(text, 'application/xml').querySelectorAll('loc')].map(node => node.textContent), xml);
    assert.equal(urls.length, 45);
    assert.equal(new Set(urls).size, urls.length);
    const documents = new Map();
    for (const url of [...urls, 'https://goodthingfor.com/pet-travel/plan']) {
      const route = new URL(url).pathname;
      const response = await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200);
      const document = await page.evaluate(() => ({
        title: document.title, description: document.querySelector('meta[name="description"]')?.content,
        h1: document.querySelectorAll('h1').length, canonical: document.querySelector('link[rel="canonical"]')?.href,
        robots: document.querySelector('meta[name="robots"]')?.content,
        ids: [...document.querySelectorAll('[id]')].map(node => node.id),
        links: [...document.querySelectorAll('a[href]')].map(node => node.href),
        structured: [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent)),
        ogTitle: document.querySelector('meta[property="og:title"]')?.content,
      }));
      assert.equal(document.h1, 1, route);
      assert.equal(document.canonical, url, route);
      assert.ok(document.title && document.description && document.ogTitle, route);
      if (!route.endsWith('/plan')) assert.ok(document.structured.length, `Index page structured data: ${route}`);
      assert.equal(document.robots, route.endsWith('/plan') ? 'noindex,follow' : 'index,follow');
      assert.equal(new Set(document.ids).size, document.ids.length, `Duplicate IDs: ${route}`);
      documents.set(route, document);
    }
    assert.equal(new Set([...documents.values()].map(document => document.title)).size, documents.size);
    let checked = 0;
    const graph = new Map();
    for (const [from, document] of documents) {
      const edges = new Set();
      for (const href of document.links) {
        const url = new URL(href);
        if (![new URL(base).host, 'goodthingfor.com'].includes(url.host)) continue;
        const target = documents.get(url.pathname);
        assert.ok(target, `Unexpected internal page from ${from}: ${href}`);
        if (url.hash) assert.ok(target.ids.includes(decodeURIComponent(url.hash.slice(1))), `Broken destination from ${from}: ${href}`);
        edges.add(url.pathname);
        checked++;
      }
      graph.set(from, edges);
    }
    let maxClicksFromHome = 0;
    let maxClicksFromAnyPage = 0;
    for (const start of graph.keys()) {
      const distances = new Map([[start, 0]]);
      const queue = [start];
      for (const current of queue) {
        for (const target of graph.get(current)) {
          if (distances.has(target)) continue;
          distances.set(target, distances.get(current) + 1);
          queue.push(target);
        }
      }
      assert.equal(distances.size, documents.size, `Unreachable public pages from ${start}`);
      const maxClicks = Math.max(...distances.values());
      if (start === '/') maxClicksFromHome = maxClicks;
      maxClicksFromAnyPage = Math.max(maxClicksFromAnyPage, maxClicks);
    }
    assert.ok(maxClicksFromHome <= 3, `Home navigation depth: ${maxClicksFromHome}`);
    console.log(JSON.stringify({ javascriptDisabled: 'PASS', pages: documents.size, canonicalSitemapUrls: urls.length, checkedInternalLinks: checked, metadataAndAnchors: 'PASS', orphanPages: 0, allPublicPagesReachableFromEveryPage: 'PASS', maxClicksFromHome, maxClicksFromAnyPage }));
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

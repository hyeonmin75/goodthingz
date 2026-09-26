const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8790';

async function main() {
  const browser = await chromium.launch({ headless: true, channel: process.env.AUDIT_BROWSER_CHANNEL || undefined });
  try {
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.route('https://pagead2.googlesyndication.com/**', r => r.abort());
    const xml = await (await fetch(base + '/sitemap.xml')).text();
    const urls = await page.evaluate(text => [...new DOMParser().parseFromString(text, 'application/xml').querySelectorAll('loc')].map(node => node.textContent), xml);
    assert.equal(urls.length, 8);
    const documents = new Map();
    for (const url of [...urls, 'https://goodthingfor.com/pet-travel/plan']) {
      const route = new URL(url).pathname;
      const response = await page.goto(base + route);
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
    for (const [from, document] of documents) {
      for (const href of document.links) {
        const url = new URL(href);
        if (![new URL(base).host, 'goodthingfor.com'].includes(url.host)) continue;
        const target = documents.get(url.pathname);
        assert.ok(target, `Unexpected internal page from ${from}: ${href}`);
        if (url.hash) assert.ok(target.ids.includes(decodeURIComponent(url.hash.slice(1))), `Broken destination from ${from}: ${href}`);
        checked++;
      }
    }
    console.log(JSON.stringify({ javascriptDisabled: 'PASS', pages: documents.size, canonicalSitemapUrls: urls.length, checkedInternalLinks: checked, metadataAndAnchors: 'PASS' }));
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

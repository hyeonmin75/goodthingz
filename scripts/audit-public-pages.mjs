import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.AUDIT_BASE_URL || 'https://goodthingfor.com';
const sitemapResponse = await fetch(base + '/sitemap.xml');
if (!sitemapResponse.ok) throw new Error('Sitemap unavailable');
const sitemap = await sitemapResponse.text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const rows = [];
for (const path of [...paths, '/pet-travel/plan', '/pet-travel?keyword=test', '/missing-audit-page', '/pet-travel/places/unknown', '/ads.txt', '/robots.txt']) {
  const response = await fetch(base + path);
  const html = await response.text();
  const text = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  rows.push({ path, status: response.status, title: html.match(/<title>(.*?)<\/title>/)?.[1], h1: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(m => m[1].replace(/<[^>]+>/g, '')), robots: html.match(/name="robots" content="([^"]+)"/)?.[1], canonical: html.match(/rel="canonical" href="([^"]+)"/)?.[1], visibleCharacters: text.length });
}
await mkdir('.wrangler/research', { recursive: true });
await writeFile('.wrangler/research/page-audit.json', JSON.stringify({ base, checkedAt: new Date().toISOString(), rows }, null, 2));
console.log(JSON.stringify(rows, null, 2));

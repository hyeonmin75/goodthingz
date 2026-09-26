import { mkdir, writeFile } from 'node:fs/promises';

// Capture a small, reproducible public sample for editorial review, never auto-publish it.
const base = 'https://goodthingfor.com';
const rows = [];
for (const contentTypeId of ['12', '14', '32', '39']) {
  const params = new URLSearchParams({ contentTypeId, arrange: 'C', page: '1', pageSize: '3' });
  const list = await (await fetch(`${base}/api/public-data/pet-tour/places?${params}`, { signal: AbortSignal.timeout(60000) })).json();
  if (!list.ok) throw new Error(`List unavailable for ${contentTypeId}`);
  for (const place of list.data.items) {
    const query = new URLSearchParams({ contentId: place.source.contentId, contentTypeId });
    const response = await fetch(`${base}/api/public-data/pet-tour/place?${query}`, { signal: AbortSignal.timeout(60000) });
    const payload = await response.json();
    if (!payload.ok) throw new Error(`Detail unavailable for ${place.source.contentId}`);
    rows.push({ place, detail: payload.data });
    console.log(`${contentTypeId} ${place.source.contentId} ${place.title}`);
  }
}
await mkdir('.wrangler/research', { recursive: true });
await writeFile('.wrangler/research/pet-sample.json', JSON.stringify({ collectedAt: new Date().toISOString(), selection: 'First 3 by modified time for each of 4 types, not a representative sample', rows }, null, 2));
console.log(`Saved ${rows.length} normalized records for review. No publication performed.`);

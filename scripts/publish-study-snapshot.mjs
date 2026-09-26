import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Run only after inspecting the research output. This publishes public fields only.
const research = JSON.parse(await readFile('.wrangler/research/pet-sample.json', 'utf8'));
assert.equal(research.rows.length, 12);
assert.equal(new Set(research.rows.map(r => r.place.source.contentId)).size, 12);
assert.equal(research.collectedAt.slice(0, 10), '2026-09-26', 'Create a new editorial edition for a new collection date');
assert.deepEqual(research.rows.map(r => r.place.source.contentId).sort(), ['2755874', '2524188', '3043644', '129894', '2714152', '2385666', '2708659', '2804371', '2570728', '736117', '2783352', '2718743'].sort(), 'Re-review the case notes before changing the sample');
const snapshot = {
  collectedAt: research.collectedAt,
  selection: research.selection,
  records: research.rows.map(({ place, detail }) => {
    assert.equal(detail.warnings.length, 0, 'Do not publish incomplete detail responses');
    return {
      id: place.source.contentId, title: place.title, type: place.contentTypeName,
      typeId: place.contentTypeId, modifiedAt: place.dates.modifiedAtRaw,
      providerUrl: detail.homepageUrl,
      image: ['Type1', 'Type3'].includes(place.media.copyrightType) && place.media.primaryImageUrl?.startsWith('https://') ? place.media.primaryImageUrl : null,
      imageLicense: place.media.copyrightType,
      scope: detail.petPolicy.companionshipType, animals: detail.petPolicy.allowedPets,
      equipment: detail.petPolicy.requiredItems, notes: detail.petPolicy.policyNotes,
      hours: detail.visitInfo.hours, checkInOut: detail.visitInfo.checkInOut,
      parking: detail.visitInfo.parking, contact: detail.contact.infoCenter || detail.contact.tel,
    };
  }),
};
await writeFile('app/content/pet-study-sample.json', JSON.stringify(snapshot, null, 2) + '\n');
console.log(`Published ${snapshot.records.length} reviewed public records; no raw responses, secrets or personal plans included.`);

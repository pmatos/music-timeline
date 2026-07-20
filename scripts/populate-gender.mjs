import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Best-effort one-off populator for the optional `gender` field in people.json.
// For each person that has a Wikipedia link but no gender yet, it resolves the
// linked Wikidata entity and reads P21 (sex or gender), mapping to the project's
// binary + unknown taxonomy:
//   male / trans man      -> "male"
//   female / trans woman  -> "female"
//   anything else / none  -> left unset (treated as unknown by the app)
// Non-binary and other identities are deliberately NOT forced into the binary.
// Re-run any time; it only fills people that don't already have a gender.

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PEOPLE_JSON = join(ROOT, 'public', 'data', 'people.json');

const DELAY_MS = 150;
const USER_AGENT =
  'MusicTimelineGenderPopulator/1.0 (https://github.com/pmatos/music-timeline)';

// Wikidata item ids for P21 (sex or gender) -> our taxonomy.
const GENDER_BY_QID = {
  Q6581097: 'male', // male
  Q6581072: 'female', // female
  Q2449503: 'male', // trans man
  Q1052281: 'female', // trans woman
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Parse a Wikipedia URL into a Wikidata site code + page title. */
function parseWiki(url) {
  try {
    const u = new URL(url);
    const m = u.hostname.match(/^([a-z-]+)\.wikipedia\.org$/i);
    if (!m) return null;
    const site = `${m[1].replace(/-/g, '_')}wiki`;
    const title = decodeURIComponent(u.pathname.replace(/^\/wiki\//, ''));
    if (!title) return null;
    return { site, title };
  } catch {
    return null;
  }
}

/** Resolve a Wikipedia article to its P21 gender value via Wikidata. */
async function fetchGender(site, title) {
  const api =
    `https://www.wikidata.org/w/api.php?action=wbgetentities` +
    `&sites=${encodeURIComponent(site)}&titles=${encodeURIComponent(title)}` +
    `&props=claims&normalize=1&format=json`;
  const resp = await fetch(api, { headers: { 'User-Agent': USER_AGENT } });
  if (!resp.ok) throw new Error(`Wikidata API ${resp.status}`);
  const data = await resp.json();
  const entities = data.entities ?? {};
  const entity = Object.values(entities).find((e) => e && e.id && e.claims);
  if (!entity) return null;
  const claim = entity.claims?.P21?.[0];
  const qid = claim?.mainsnak?.datavalue?.value?.id;
  return qid ? (GENDER_BY_QID[qid] ?? null) : null;
}

/** Insert `gender` right after `role` so the object stays readable. */
function withGender(person, gender) {
  const out = {};
  for (const [k, v] of Object.entries(person)) {
    out[k] = v;
    if (k === 'role') out.gender = gender;
  }
  return out;
}

async function main() {
  const people = JSON.parse(await readFile(PEOPLE_JSON, 'utf-8'));

  const todo = people.filter((p) => p.gender == null && p.wikiUrl);
  console.log(`Checking ${todo.length} people without a gender...`);

  let female = 0,
    male = 0,
    unknown = 0,
    failed = 0;

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    if (person.gender != null || !person.wikiUrl) continue;

    const wiki = parseWiki(person.wikiUrl);
    if (!wiki) {
      unknown++;
      continue;
    }

    try {
      const gender = await fetchGender(wiki.site, wiki.title);
      if (gender === 'female' || gender === 'male') {
        people[i] = withGender(person, gender);
        if (gender === 'female') female++;
        else male++;
        console.log(`  [${gender}] ${person.id}`);
      } else {
        unknown++;
        console.log(`  [unknown] ${person.id}`);
      }
    } catch (err) {
      failed++;
      console.error(`  [error] ${person.id}: ${err.message}`);
    }

    await sleep(DELAY_MS);
  }

  await writeFile(PEOPLE_JSON, JSON.stringify(people, null, 2) + '\n');
  console.log(
    `\nDone: ${female} female, ${male} male, ${unknown} unknown/unmapped, ${failed} failed.`,
  );
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

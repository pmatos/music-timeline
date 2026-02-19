import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PEOPLE_JSON = join(ROOT, 'public', 'data', 'people.json');
const PORTRAITS_DIR = join(ROOT, 'public', 'images', 'portraits');

// Map person ID to their Wikipedia article title.
// The script fetches the article's main image thumbnail via the Wikipedia API.
const WIKIPEDIA_TITLES = {
  'corelli': 'Arcangelo_Corelli',
  'vivaldi': 'Antonio_Vivaldi',
  'tartini': 'Giuseppe_Tartini',
  'geminiani': 'Francesco_Geminiani',
  'locatelli': 'Pietro_Locatelli',
  'leclair': 'Jean-Marie_Leclair',
  'viotti': 'Giovanni_Battista_Viotti',
  'rode': 'Pierre_Rode',
  'kreutzer': 'Rodolphe_Kreutzer',
  'baillot': 'Pierre_Baillot',
  'spohr': 'Louis_Spohr',
  'paganini': 'Niccolò_Paganini',
  'vieuxtemps': 'Henri_Vieuxtemps',
  'wieniawski': 'Henryk_Wieniawski',
  'sarasate': 'Pablo_de_Sarasate',
  'joachim': 'Joseph_Joachim',
  'auer': 'Leopold_Auer',
  'ysaye': 'Eugène_Ysaÿe',
  'kreisler': 'Fritz_Kreisler',
  'heifetz': 'Jascha_Heifetz',
  'oistrakh': 'David_Oistrakh',
  'menuhin': 'Yehudi_Menuhin',
  'milstein': 'Nathan_Milstein',
  'stern': 'Isaac_Stern',
  'szeryng': 'Henryk_Szeryng',
  'grumiaux': 'Arthur_Grumiaux',
  'kogan': 'Leonid_Kogan',
  'haendel': 'Ida_Haendel',
  'perlman': 'Itzhak_Perlman',
  'zukerman': 'Pinchas_Zukerman',
  'kremer': 'Gidon_Kremer',
  'mutter': 'Anne-Sophie_Mutter',
  'vengerov': 'Maxim_Vengerov',
  'hahn': 'Hilary_Hahn',
  'jansen': 'Janine_Jansen',
  'bell': 'Joshua_Bell',
  'shaham': 'Gil_Shaham',
  'chen': 'Ray_Chen_(musician)',
};

const THUMB_SIZE = 400;
const DELAY_MS = 2000;
const USER_AGENT = 'MusicTimelinePortraitDownloader/1.0 (https://github.com/pmatos/music-timeline)';

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getThumbnailUrl(wikiTitle) {
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&piprop=thumbnail&pithumbsize=${THUMB_SIZE}&format=json`;
  const resp = await fetch(apiUrl, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!resp.ok) {
    throw new Error(`Wikipedia API failed: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json();
  const pages = data.query?.pages;
  if (!pages) throw new Error('No pages in API response');

  const page = Object.values(pages)[0];
  if (page.missing !== undefined) {
    throw new Error(`Wikipedia article not found: ${wikiTitle}`);
  }

  const thumbUrl = page.thumbnail?.source;
  if (!thumbUrl) {
    throw new Error(`No thumbnail image for Wikipedia article: ${wikiTitle}`);
  }

  return thumbUrl;
}

async function downloadImage(url, destPath) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!resp.ok) {
    throw new Error(`Download failed: ${resp.status} ${resp.statusText}`);
  }

  const buffer = Buffer.from(await resp.arrayBuffer());
  await writeFile(destPath, buffer);
}

async function main() {
  const peopleRaw = await readFile(PEOPLE_JSON, 'utf-8');
  const people = JSON.parse(peopleRaw);

  const toDownload = people.filter(
    p => p.photoUrl?.startsWith('/images/portraits/') && p.id in WIKIPEDIA_TITLES
  );

  console.log(`Found ${toDownload.length} portraits to check.`);

  await mkdir(PORTRAITS_DIR, { recursive: true });

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const person of toDownload) {
    const destPath = join(ROOT, 'public', person.photoUrl);

    if (await fileExists(destPath)) {
      console.log(`  [skip] ${person.id} - already exists`);
      skipped++;
      continue;
    }

    const wikiTitle = WIKIPEDIA_TITLES[person.id];
    try {
      console.log(`  [download] ${person.id} (${wikiTitle})...`);
      const thumbUrl = await getThumbnailUrl(wikiTitle);
      await downloadImage(thumbUrl, destPath);
      console.log(`  [done] ${person.id} -> ${destPath}`);
      downloaded++;
    } catch (err) {
      console.error(`  [error] ${person.id}: ${err.message}`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nFinished: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

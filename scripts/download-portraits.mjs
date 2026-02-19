import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PEOPLE_JSON = join(ROOT, 'public', 'data', 'people.json');
const PORTRAITS_DIR = join(ROOT, 'public', 'images', 'portraits');

const PORTRAIT_SOURCES = {
  'corelli': 'File:Corelli.jpg',
  'vivaldi': 'File:Antonio_Vivaldi.jpg',
  'tartini': 'File:Giuseppe_Tartini.jpg',
  'geminiani': 'File:Francesco_Geminiani.jpg',
  'locatelli': 'File:Pietro_Locatelli.jpg',
  'leclair': 'File:Jean-Marie_Leclair.jpg',
  'viotti': 'File:Giovanni_Battista_Viotti.jpg',
  'rode': 'File:Pierre_Rode.jpg',
  'kreutzer': 'File:Rodolphe_Kreutzer.jpg',
  'baillot': 'File:Pierre_Baillot.jpg',
  'spohr': 'File:Louis_Spohr.jpg',
  'paganini': 'File:Niccolò_Paganini.jpg',
  'vieuxtemps': 'File:Henri_Vieuxtemps.jpg',
  'wieniawski': 'File:Henryk_Wieniawski.jpg',
  'sarasate': 'File:Pablo_de_Sarasate.jpg',
  'joachim': 'File:Joseph_Joachim.jpg',
  'auer': 'File:Leopold_Auer.jpg',
  'ysaye': 'File:Eugène_Ysaÿe.jpg',
  'kreisler': 'File:Fritz_Kreisler.jpg',
  'heifetz': 'File:Jascha_Heifetz.jpg',
  'oistrakh': 'File:David_Oistrakh.jpg',
  'menuhin': 'File:Yehudi_Menuhin.jpg',
  'milstein': 'File:Nathan_Milstein.jpg',
  'stern': 'File:Isaac_Stern.jpg',
  'szeryng': 'File:Henryk_Szeryng.jpg',
  'grumiaux': 'File:Arthur_Grumiaux.jpg',
  'kogan': 'File:Leonid_Kogan.jpg',
  'haendel': 'File:Ida_Haendel.jpg',
  'perlman': 'File:Itzhak_Perlman.jpg',
  'zukerman': 'File:Pinchas_Zukerman.jpg',
  'kremer': 'File:Gidon_Kremer.jpg',
  'mutter': 'File:Anne-Sophie_Mutter.jpg',
  'vengerov': 'File:Maxim_Vengerov.jpg',
  'hahn': 'File:Hilary_Hahn.jpg',
  'jansen': 'File:Janine_Jansen.jpg',
  'bell': 'File:Joshua_Bell.jpg',
  'shaham': 'File:Gil_Shaham.jpg',
  'chen': 'File:Ray_Chen.jpg',
};

const DELAY_MS = 500;

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

async function getImageUrl(commonsFilename) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(commonsFilename)}&prop=imageinfo&iiprop=url&format=json`;
  const resp = await fetch(apiUrl, {
    headers: { 'User-Agent': 'MusicTimelinePortraitDownloader/1.0' },
  });

  if (!resp.ok) {
    throw new Error(`API request failed: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json();
  const pages = data.query?.pages;
  if (!pages) throw new Error('No pages in API response');

  const page = Object.values(pages)[0];
  if (page.missing !== undefined) {
    throw new Error(`File not found on Wikimedia Commons: ${commonsFilename}`);
  }

  const imageInfo = page.imageinfo?.[0];
  if (!imageInfo?.url) {
    throw new Error(`No image URL in response for: ${commonsFilename}`);
  }

  return imageInfo.url;
}

async function downloadImage(url, destPath) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'MusicTimelinePortraitDownloader/1.0' },
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
    p => p.photoUrl?.startsWith('/images/portraits/') && p.id in PORTRAIT_SOURCES
  );

  console.log(`Found ${toDownload.length} violin portraits to check.`);

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

    const commonsFilename = PORTRAIT_SOURCES[person.id];
    try {
      console.log(`  [download] ${person.id} from ${commonsFilename}...`);
      const imageUrl = await getImageUrl(commonsFilename);
      await downloadImage(imageUrl, destPath);
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

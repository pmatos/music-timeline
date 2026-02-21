import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const SCREENSHOT_DIR = join(import.meta.dirname, 'public', 'screenshots');
const URL = 'https://musiker.page';
const VIEWPORT = { width: 1920, height: 1080, deviceScaleFactor: 2 };

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function capture(page, name) {
  const path = join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path, type: 'png' });
  console.log(`  Captured: ${name}.png`);
}

async function main() {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--window-size=1920,1080'],
  });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  console.log('Navigating to musiker.page...');
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2000);

  // 1. Piano full view — zoomed out, nothing selected
  console.log('1. Piano full view');
  await capture(page, 'piano-full');

  // 2. Piano medium zoom — scroll right to Baroque-Classical transition
  console.log('2. Piano medium zoom');
  const timelineContainer = await page.$('.timeline-view');
  if (timelineContainer) {
    await page.evaluate(el => { el.scrollLeft = 200; }, timelineContainer);
  }
  await delay(500);
  await capture(page, 'piano-medium');

  // 3. Bach connections — click on J.S. Bach
  console.log('3. Bach connections');
  // Find and click J.S. Bach bar
  const bachBar = await page.evaluate(() => {
    const bars = document.querySelectorAll('.person-bar');
    for (const bar of bars) {
      const text = bar.textContent || bar.querySelector('text')?.textContent || '';
      if (text.includes('J.S. Bach')) {
        const rect = bar.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      }
    }
    // Try SVG text elements
    const texts = document.querySelectorAll('text');
    for (const t of texts) {
      if (t.textContent?.includes('J.S. Bach')) {
        const rect = t.closest('g')?.getBoundingClientRect() || t.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      }
    }
    return null;
  });

  if (bachBar) {
    await page.mouse.click(bachBar.x, bachBar.y);
    await delay(1000);
  } else {
    console.log('  Warning: Could not find J.S. Bach bar');
  }
  await capture(page, 'bach-connections');

  // 4. Bach panel — should already be open from click
  console.log('4. Bach panel');
  await capture(page, 'bach-panel');

  // 5. Color mix — close panel, find area with mixed colors
  console.log('5. Color mix');
  // Press Escape to close panel
  await page.keyboard.press('Escape');
  await delay(500);
  // Scroll to show a mix of blue/orange/purple bars
  if (timelineContainer) {
    await page.evaluate(el => { el.scrollLeft = 400; }, timelineContainer);
  }
  await delay(500);
  await capture(page, 'color-mix');

  // 6. Violin full — switch instrument
  console.log('6. Violin full');
  const select = await page.$('select');
  if (select) {
    await page.select('select', 'violin');
    await delay(2000);
  }
  // Reset scroll
  const newContainer = await page.$('.timeline-view');
  if (newContainer) {
    await page.evaluate(el => { el.scrollLeft = 0; }, newContainer);
  }
  await delay(500);
  await capture(page, 'violin-full');

  // 7. Trombone full
  console.log('7. Trombone full');
  if (select) {
    await page.select('select', 'trombone');
    await delay(2000);
  }
  await capture(page, 'trombone-full');

  // 8. Eras zoom — switch back to piano, show eras clearly
  console.log('8. Eras zoom');
  if (select) {
    await page.select('select', 'piano');
    await delay(2000);
  }
  await capture(page, 'eras-zoom');

  // 9. Hero clean — piano default, clean shot
  console.log('9. Hero clean');
  // Already on piano, make sure nothing selected
  await page.keyboard.press('Escape');
  await delay(500);
  await capture(page, 'hero-clean');

  await browser.close();
  console.log('\nDone! All screenshots saved to video/public/screenshots/');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

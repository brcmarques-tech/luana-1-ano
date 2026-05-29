import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'scripts/screenshots/flow-check';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`💥 ${e.message}\n${e.stack?.split('\n').slice(0,3).join('\n')}`));

await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const currentScreen = () => page.evaluate(() => document.querySelector('.screen.active')?.id || '(none)');

const step = async (label, action) => {
  if (action) await action();
  await page.waitForTimeout(400);
  const active = await currentScreen();
  console.log(`[${label.padEnd(22)}] active = ${active}`);
};

await step('00 boot');
await page.screenshot({ path: `${OUT}/00-gate.png` });

await step('01 click Sim', () => page.locator('#btn-yes').click());

// preloader ~5-7s (fetch timeout)
await page.waitForTimeout(7000);
await step('02 after preloader');

await page.waitForTimeout(5000);
await step('03 welcome ready');
await page.screenshot({ path: `${OUT}/03-welcome.png` });

await step('04 -> hanami', () => page.locator('#btn-start').click({ force: true }));
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/04-hanami.png` });

await step('05 -> journey', () => page.locator('#btn-hanami-next').click({ force: true }));
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/05-journey.png` });

await page.evaluate(() => {
  const t = document.getElementById('timeline');
  t.children[t.children.length - 1]?.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
});
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/06-timeline-last.png` });

await step('07 -> serendipity', () => page.locator('#btn-to-loves').click({ force: true }));
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/07-serendipity.png` });

await step('08 -> loves', () => page.locator('#btn-serendipity-next').click({ force: true }));
await page.waitForTimeout(800);

await page.evaluate(() => {
  const s = document.querySelector('.loves-scroll');
  if (s) s.scrollTop = s.scrollHeight;
});
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/09-loves-bottom.png` });

await step('10 -> game', () => page.locator('#btn-to-game').click({ force: true }));
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/10-game.png` });

// força vitória no game
await page.evaluate(() => {
  document.querySelectorAll('.memory-card').forEach((c) => c.classList.add('flipped', 'matched'));
  document.getElementById('game-pairs').textContent = '6/6';
  document.getElementById('game-win').hidden = false;
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/11-game-win.png` });

await step('12 -> card (deck)', () => page.locator('#btn-to-final').click({ force: true }));
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/12-card-deck.png` });

const firstUnlocked = page.locator('.deck-card--unlocked').first();
const unlockedCount = await firstUnlocked.count();
console.log(`  deck-cards unlocked: ${unlockedCount}`);
if (unlockedCount > 0) {
  await firstUnlocked.click({ force: true });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/13-card-flipped.png` });
}

const deckNext = page.locator('#btn-deck-next');
if (await deckNext.isVisible().catch(() => false)) {
  await step('14 -> main card', () => deckNext.click({ force: true }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/14-card-main.png` });
} else {
  console.log('  (deck-next NOT visible — skipping)');
}

const cardNext = page.locator('#btn-card-next');
if (await cardNext.isVisible().catch(() => false)) {
  await step('15 -> final', () => cardNext.click({ force: true }));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/15-final.png` });
}

console.log('\n=== ERROS DETECTADOS ===');
console.log(errors.length ? errors.join('\n---\n') : '(nenhum) ✅');

await browser.close();

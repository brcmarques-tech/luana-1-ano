import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'scripts/screenshots/transitions';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

// Vai pra welcome (1ª transição com anime)
await page.locator('#btn-yes').click();
await page.waitForTimeout(180);
await page.screenshot({ path: `${OUT}/t1-welcome-mid.png` });
await page.waitForTimeout(3500);

// welcome -> journey
await page.locator('#btn-start').click();
await page.waitForTimeout(150);
await page.screenshot({ path: `${OUT}/t2-journey-mid.png` });
await page.waitForTimeout(900);

// journey -> loves
const timeline = page.locator('#timeline');
await timeline.evaluate((el) => {
  el.children[el.children.length - 1]?.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
});
await page.waitForTimeout(500);
await page.locator('#btn-to-loves').click();
await page.waitForTimeout(150);
await page.screenshot({ path: `${OUT}/t3-loves-mid.png` });
await page.waitForTimeout(800);

// loves -> game
const lovesScroll = page.locator('.loves-scroll');
await lovesScroll.evaluate((el) => { el.scrollTop = el.scrollHeight; });
await page.waitForTimeout(500);
await page.locator('#btn-to-game').click();
await page.waitForTimeout(150);
await page.screenshot({ path: `${OUT}/t4-game-mid.png` });
await page.waitForTimeout(800);

console.log('Transition screenshots saved');
await browser.close();

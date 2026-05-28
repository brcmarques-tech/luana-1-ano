import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'scripts/screenshots/eggs';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

// ===== EGG 1: triplo click no nome Luana (welcome) =====
await page.evaluate(() => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-welcome').classList.add('active');
  document.getElementById('welcome-name').textContent = 'Luana';
  document.getElementById('welcome-name').classList.add('done');
});
await page.waitForTimeout(300);

const nameEl = page.locator('#welcome-name');
await nameEl.click();
await page.waitForTimeout(100);
await nameEl.click();
await page.waitForTimeout(100);
await nameEl.click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/egg1-welcome-name.png` });

// ===== EGG 2: click no contador da timeline =====
await page.evaluate(() => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-journey').classList.add('active');
});
// dispara o render manualmente
await page.evaluate(() => {
  document.getElementById('btn-start').click?.();
});
await page.waitForTimeout(800);
await page.evaluate(() => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-journey').classList.add('active');
});
await page.waitForTimeout(400);

const counterEl = page.locator('#journey-counter');
await counterEl.click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/egg2-counter-stat1.png` });

await counterEl.click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/egg2-counter-stat2.png` });

// ===== EGG 3: triplo click no coração da final =====
await page.evaluate(() => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-final').classList.add('active');
  // força render
  document.getElementById('btn-to-final')?.click?.();
});
await page.waitForTimeout(1500);
await page.evaluate(() => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-final').classList.add('active');
});
await page.waitForTimeout(800);

const heartEl = page.locator('.final-heart');
await heartEl.click({ force: true });
await page.waitForTimeout(100);
await heartEl.click({ force: true });
await page.waitForTimeout(100);
await heartEl.click({ force: true });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/egg3-final-heart-storm.png` });

// ===== EGG 4: digitar "luana" =====
await page.evaluate(() => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-gate').classList.add('active');
});
await page.waitForTimeout(300);
await page.keyboard.type('luana', { delay: 80 });
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/egg4-konami-message.png` });

console.log('Eggs screenshots saved to', OUT);
await browser.close();

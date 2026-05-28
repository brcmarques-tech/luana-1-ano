import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = 'scripts/screenshots/check';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();

const errors = [];
const consoleMsgs = [];
page.on('console', (msg) => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
page.on('requestfailed', (r) => errors.push(`REQFAIL: ${r.url()} — ${r.failure()?.errorText}`));

await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const state = await page.evaluate(() => {
  return {
    sakuraLayer: !!document.querySelector('.sakura-layer'),
    sakuraPetals: document.querySelectorAll('.sakura-petal').length,
    pawLayer: !!document.querySelector('.paw-trail-layer'),
    lanternLayer: !!document.querySelector('.lantern-layer'),
    petLayer: !!document.querySelector('.pet-layer'),
    hud: !!document.querySelector('.hud'),
    htmlClass: document.documentElement.className,
    bodyCursor: getComputedStyle(document.body).cursor,
    scripts: Array.from(document.scripts).map(s => s.src.replace(location.origin, '') || '(inline)'),
  };
});

await page.screenshot({ path: `${OUT}/01-on-load.png` });

// click numa área vazia (longe dos botões)
await page.mouse.click(195, 600);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/02-after-click.png` });

const afterClick = await page.evaluate(() => ({
  pawCount: document.querySelectorAll('.paw-burst').length,
  pawFirst: document.querySelector('.paw-burst') ? {
    opacity: getComputedStyle(document.querySelector('.paw-burst')).opacity,
    fontSize: getComputedStyle(document.querySelector('.paw-burst')).fontSize,
    pos: { left: document.querySelector('.paw-burst').style.left, top: document.querySelector('.paw-burst').style.top },
  } : null,
}));

console.log('=== STATE ON LOAD ===');
console.log(JSON.stringify(state, null, 2));
console.log('=== AFTER CLICK ===');
console.log(JSON.stringify(afterClick, null, 2));
console.log('=== ERRORS ===');
console.log(errors.length ? errors.join('\n') : '(none)');
console.log('=== CONSOLE ===');
console.log(consoleMsgs.length ? consoleMsgs.join('\n') : '(none)');

await browser.close();

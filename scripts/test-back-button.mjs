import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = 'scripts/screenshots/back';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`💥 ${e.message}`));

page.on('console', (m) => { if (m.type() === 'error') console.log('[console err]', m.text()); });

await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const visibleAt = async (label) => {
  const info = await page.evaluate(() => {
    const el = document.getElementById('btn-back-global');
    const cur = document.querySelector('.screen.active')?.id;
    if (!el) return { cur, exists: false };
    return {
      cur,
      exists: true,
      opacity: getComputedStyle(el).opacity,
      pointerEvents: getComputedStyle(el).pointerEvents,
    };
  });
  console.log(`[${label.padEnd(22)}] ${JSON.stringify(info)}`);
};

await visibleAt('00 gate');
await page.locator('#btn-yes').click();
await page.waitForTimeout(700);
await visibleAt('01 loading');

await page.waitForTimeout(7000);
await visibleAt('02 welcome');

await page.waitForTimeout(5000);
await page.locator('#btn-start').click({ force: true });
await page.waitForTimeout(900);
await visibleAt('03 hanami');
await page.screenshot({ path: `${OUT}/03-hanami-with-back.png` });

await page.locator('#btn-hanami-next').click({ force: true });
await page.waitForTimeout(900);
await visibleAt('04 journey');

// agora testa voltar
await page.locator('#btn-back-global').click({ force: true });
await page.waitForTimeout(900);
await visibleAt('05 back -> hanami');

await page.locator('#btn-back-global').click({ force: true });
await page.waitForTimeout(900);
await visibleAt('06 back -> welcome (escondido)');

console.log('\n=== ERROS ===');
console.log(errors.length ? errors.join('\n') : '(nenhum) ✅');
await browser.close();

import { chromium, devices } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  ...devices['iPhone 13'],
  hasTouch: true,
});
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`💥 ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') console.log('[console]', m.text()); });

await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

const dump = async (label) => {
  const info = await page.evaluate(() => {
    const yes = document.getElementById('btn-yes');
    const no = document.getElementById('btn-no');
    return {
      active: document.querySelector('.screen.active')?.id,
      yesExists: !!yes,
      yesEvents: yes ? Object.keys(yes).filter(k => k.startsWith('on') && yes[k]).length : 0,
      yesCS: yes ? {
        pointerEvents: getComputedStyle(yes).pointerEvents,
        visibility: getComputedStyle(yes).visibility,
        opacity: getComputedStyle(yes).opacity,
        zIndex: getComputedStyle(yes).zIndex,
      } : null,
      noBounding: no ? no.getBoundingClientRect().toJSON() : null,
      yesBounding: yes ? yes.getBoundingClientRect().toJSON() : null,
    };
  });
  console.log(`[${label}]`, JSON.stringify(info, null, 2));
};

await dump('antes do tap');

// tap REAL (toque) no botão Sim
console.log('\n>>> tapando no Sim com page.tap() <<<');
await page.tap('#btn-yes');
await page.waitForTimeout(800);
await dump('após tap');

console.log('\n=== ERROS ===');
console.log(errors.length ? errors.join('\n') : '(nenhum) ✅');
await browser.close();

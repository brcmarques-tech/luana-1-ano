import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false, slowMo: 30 });
const ctx = await browser.newContext({ viewport: { width: 420, height: 820 } });
const page = await ctx.newPage();

page.on('console', (m) => console.log(`[${m.type()}]`, m.text()));
page.on('pageerror', (e) => console.log('💥 PAGEERROR:', e.message));
page.on('requestfailed', (r) => {
  const url = r.url();
  if (!url.includes('localhost:3003')) {
    console.log('⚠️  REQ FAIL:', url, '—', r.failure()?.errorText);
  }
});

console.log('>>> abrindo http://localhost:8080 <<<');
await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

const state = await page.evaluate(() => ({
  url: location.href,
  title: document.title,
  bodyChildren: document.body.children.length,
  screens: Array.from(document.querySelectorAll('.screen')).map(s => ({
    id: s.id,
    active: s.classList.contains('active'),
  })),
  buttons: {
    yes: !!document.getElementById('btn-yes'),
    no: !!document.getElementById('btn-no'),
    back: !!document.getElementById('btn-back-global'),
    sky: !!document.getElementById('btn-sky'),
    mute: !!document.getElementById('btn-mute'),
  },
  hud: !!document.querySelector('.hud'),
  cssLoaded: getComputedStyle(document.body).fontFamily,
}));

console.log('\n=== ESTADO ===');
console.log(JSON.stringify(state, null, 2));

console.log('\n>>> janela ficará aberta 60s. Tenta apertar Sim/Não pra ver o que rola <<<');
await page.waitForTimeout(60000);
await browser.close();

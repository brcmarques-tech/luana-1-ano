import { chromium, devices } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`💥 ${e.message}`));

await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const swInfo = await page.evaluate(async () => {
  if (!('serviceWorker' in navigator)) return { supported: false };
  const reg = await navigator.serviceWorker.getRegistration();
  return {
    supported: true,
    hasRegistration: !!reg,
    scope: reg?.scope,
    active: reg?.active?.scriptURL,
    state: reg?.active?.state,
  };
});

console.log('SW:', JSON.stringify(swInfo, null, 2));

const cacheInfo = await page.evaluate(async () => {
  if (!('caches' in self)) return { supported: false };
  const names = await caches.keys();
  const sizes = {};
  for (const n of names) {
    const c = await caches.open(n);
    const k = await c.keys();
    sizes[n] = k.length;
  }
  return { supported: true, names, sizes };
});
console.log('CACHE:', JSON.stringify(cacheInfo, null, 2));

console.log('ERROS:', errors.length ? errors.join('\n') : '(nenhum) ✅');
await browser.close();

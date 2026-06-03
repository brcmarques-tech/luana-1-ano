// Teste E2E real: frontend (8080) + backend (3003) + Postgres.
// Salva via admin, verifica no DB, recarrega no front e confirma override.

import { chromium, devices } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`💥 ${e.message}`));

console.log('>>> 1. abrindo site...');
await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

console.log('>>> 2. setando auth admin REAL (apontando pra 127.0.0.1:3003)...');
await page.evaluate(() => {
  sessionStorage.setItem('luana_admin', JSON.stringify({
    apiUrl: 'http://127.0.0.1:3003',
    secret: 'luana-admin-2026',
  }));
});

console.log('>>> 3. abrindo admin → tab Textos → Tela final...');
await page.evaluate(async () => {
  const mod = await import('./js/admin.js');
  mod.openAdminPanel();
});
await page.waitForTimeout(600);
await page.locator('[data-tab="texts"]').click({ force: true });
await page.waitForTimeout(400);
await page.locator('[data-schema="final"]').click({ force: true });
await page.waitForTimeout(600);

console.log('>>> 4. editando signature → salvando...');
await page.locator('[data-path="signature"]').fill('— E2E REAL ✅');
await page.waitForTimeout(200);
await page.locator('#admin-texts-save').click({ force: true });
await page.waitForTimeout(2000);

const saveMsg = await page.evaluate(() => document.getElementById('admin-texts-saved')?.textContent);
console.log('   msg:', saveMsg);

console.log('>>> 5. verificando que foi persistido no banco via API...');
const apiRes = await fetch('http://127.0.0.1:3003/content');
const apiData = await apiRes.json();
console.log('   API /content:', JSON.stringify(apiData).slice(0, 200));

console.log('>>> 6. abrindo nova janela (sem localStorage) pra simular Luana...');
const ctx2 = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page2 = await ctx2.newPage();
const contentReqs = [];
page2.on('request', (r) => {
  if (r.url().includes('/content')) contentReqs.push(`${r.method()} ${r.url()}`);
});
await page2.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page2.waitForTimeout(6000);
console.log('   requests pra /content:', contentReqs);

const luanaCheck = await page2.evaluate(async () => {
  const ls = localStorage.getItem('luana_content_overrides');
  const sentinel = sessionStorage.getItem('_content_reloaded');
  const m = await import('./js/final-data.js?ts=' + Date.now());
  return { signature: m.FINAL.signature, ls: ls?.slice(0, 100), sentinel };
});
console.log('   nova sessão:', JSON.stringify(luanaCheck));

console.log('>>> 7. resetando via API...');
await fetch('http://127.0.0.1:3003/content/final', {
  method: 'DELETE',
  headers: { Authorization: 'Bearer luana-admin-2026' },
});
const afterReset = await fetch('http://127.0.0.1:3003/content').then(r => r.json());
console.log('   API após reset:', JSON.stringify(afterReset));

console.log('\n=== ERROS JS ===');
console.log(errors.length ? errors.join('\n') : '(nenhum) ✅');
await browser.close();

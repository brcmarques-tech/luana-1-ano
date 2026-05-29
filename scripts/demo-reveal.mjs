// Modo HEADED: janela do navegador aparece pra você ver.
// Força as 7 estrelas e dispara o reveal automaticamente.

import { chromium, devices } from 'playwright';

const browser = await chromium.launch({ headless: false, slowMo: 80 });
const ctx = await browser.newContext({
  ...devices['iPhone 13'],
  hasTouch: true,
});
const page = await ctx.newPage();

await page.goto('http://localhost:8080/?cn=complete', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// abre a Constelação
await page.locator('#btn-sky').click({ force: true });
await page.waitForTimeout(1500);

// dispara o reveal
await page.locator('#cn-reveal-btn').click({ force: true });

// deixa a janela aberta por 30s pra você ver a sequência completa
console.log('reveal disparado — janela ficará aberta por 30s');
await page.waitForTimeout(30000);

await browser.close();

// Modo VISÍVEL - abre janela do chromium pra você ver
// e força a tela direto na hanami pra mostrar os 2 botões questionados.

import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false, slowMo: 60 });
const ctx = await browser.newContext({ viewport: { width: 420, height: 800 } });
const page = await ctx.newPage();

page.on('console', (m) => console.log(`[${m.type()}]`, m.text()));
page.on('pageerror', (e) => console.log('[ERROR]', e.message));

await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// vai direto pra hanami
await page.locator('#btn-yes').click({ force: true });
await page.waitForTimeout(7500);
await page.locator('#btn-start').click({ force: true });
await page.waitForTimeout(1500);

// abre o perfil pra mostrar o botão de troféus
console.log('\n>>> abrindo perfil <<<');
await page.locator('#hud-avatar').click({ force: true });

console.log('\n>>> janela ficará aberta 40s <<<');
await page.waitForTimeout(40000);
await browser.close();

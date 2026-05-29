import { chromium, devices } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`💥 ${e.message}`));

await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// abre perfil clicando no avatar
await page.locator('#hud-avatar').click({ force: true });
await page.waitForTimeout(500);

// check botão existe
const btnInfo = await page.evaluate(() => {
  const btn = document.getElementById('profile-trophy-btn');
  if (!btn) return { found: false };
  return {
    found: true,
    text: btn.textContent,
    visible: btn.offsetParent !== null,
    pointerEvents: getComputedStyle(btn).pointerEvents,
  };
});
console.log('btn-trophy:', JSON.stringify(btnInfo, null, 2));

// clica
await page.locator('#profile-trophy-btn').click({ force: true });
await page.waitForTimeout(800);

// check drawer abriu
const drawer = await page.evaluate(() => {
  const el = document.getElementById('ach-drawer');
  return { exists: !!el, open: el?.classList.contains('open') };
});
console.log('drawer:', JSON.stringify(drawer, null, 2));

console.log('\n=== ERROS ===');
console.log(errors.length ? errors.join('\n') : '(nenhum) ✅');
await browser.close();

import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'scripts/screenshots/constellation';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`💥 ${e.message}\n${e.stack?.split('\n').slice(0,3).join('\n')}`));

await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// reset state da constelação pra testar fresh
await page.evaluate(() => {
  localStorage.removeItem('luana_constellation');
});

// verifica botão ✦
const skyBtnExists = await page.locator('#btn-sky').isVisible().catch(() => false);
console.log('sky button visible:', skyBtnExists);

await page.screenshot({ path: `${OUT}/00-gate-with-sky-button.png` });

// clica no botão da constelação
if (skyBtnExists) {
  await page.locator('#btn-sky').click({ force: true });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/01-constellation-day1.png` });

  // verifica state
  const cnState = await page.evaluate(() => {
    const screen = document.getElementById('screen-constellation');
    const canvas = document.getElementById('cn-canvas');
    const panel = document.getElementById('cn-panel');
    return {
      screenActive: screen?.classList.contains('active'),
      canvasExists: !!canvas,
      canvasW: canvas?.width,
      canvasH: canvas?.height,
      panelContent: panel?.textContent?.slice(0, 100),
    };
  });
  console.log('constellation state:', JSON.stringify(cnState, null, 2));

  // seleciona uma opção
  await page.locator('input[name="cn-opt"]').first().click({ force: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/02-option-selected.png` });

  // submit
  await page.locator('#cn-submit').click({ force: true });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/03-after-submit.png` });

  // aguarda voltar pra wait state
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/04-wait-state.png` });

  // força completar tudo via JS pra testar reveal
  await page.evaluate(() => {
    const state = {
      firstAccess: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 dias atrás
      answers: {
        1: { optionId: 'a', text: '', ts: Date.now() },
        2: { optionId: 'a', text: '', ts: Date.now() },
        3: { optionId: 'a', text: '', ts: Date.now() },
        4: { optionId: 'a', text: '', ts: Date.now() },
        5: { optionId: 'a', text: '', ts: Date.now() },
        6: { optionId: null, text: 'meu', ts: Date.now() },
        7: { optionId: null, text: 'aquela tarde', ts: Date.now() },
      },
    };
    localStorage.setItem('luana_constellation', JSON.stringify(state));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.locator('#btn-sky').click({ force: true });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/05-constellation-complete.png` });

  // clica "ver agora" pra ativar reveal
  const revealBtn = await page.locator('#cn-reveal-btn').isVisible().catch(() => false);
  console.log('reveal button visible:', revealBtn);
  if (revealBtn) {
    await page.locator('#cn-reveal-btn').click({ force: true });

    // 1) linhas conectando estrelas (sky reveal)
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/06-sky-lines.png` });

    // 2) mapa aparece + contorno desenhando
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/07-map-outline.png` });

    // 3) zoom in até o ponto
    await page.waitForTimeout(2400);
    await page.screenshot({ path: `${OUT}/08-map-zoomed.png` });

    // 4) pin visível + texto aparece
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/09-reveal-text.png` });
  }
}

console.log('\n=== ERROS ===');
console.log(errors.length ? errors.join('\n---\n') : '(nenhum) ✅');

await browser.close();

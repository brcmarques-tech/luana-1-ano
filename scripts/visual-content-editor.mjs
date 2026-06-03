// Testes visuais do editor de textos no painel admin.
// Tira screenshots em pontos chave pra avaliar UI/UX visualmente.

import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = 'scripts/screenshots/content-editor';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], hasTouch: true });
const page = await ctx.newPage();

await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// auth simulado
await page.evaluate(() => {
  sessionStorage.setItem('luana_admin', JSON.stringify({
    apiUrl: 'http://localhost:3003', secret: 'test-secret',
  }));
});

// abre admin
await page.evaluate(async () => {
  const mod = await import('./js/admin.js');
  mod.openAdminPanel();
});
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/01-admin-default.png` });

// tab Textos
await page.locator('[data-tab="texts"]').click({ force: true });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/02-tab-textos-lista.png` });

// abre Tela final
await page.locator('[data-schema="final"]').click({ force: true });
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/03-editor-final.png` });

// scroll pra mostrar mais fields
await page.evaluate(() => document.getElementById('admin-texts-editor').scrollIntoView({ block: 'start' }));
await page.evaluate(() => window.scrollBy(0, 300));
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/04-editor-final-scrolled.png` });

// edita um campo
await page.locator('[data-path="signature"]').fill('— TESTE PLAYWRIGHT');
await page.waitForTimeout(200);

// salva
await page.locator('#admin-texts-save').click({ force: true });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/05-after-save.png` });

// volta
await page.locator('#admin-texts-back').click({ force: true });
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/06-back-to-list.png` });

// abre "Coisas que ama"
await page.locator('[data-schema="loves"]').click({ force: true });
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/07-editor-loves.png` });

// volta
await page.locator('#admin-texts-back').click({ force: true });
await page.waitForTimeout(300);

// abre Constelação
await page.locator('[data-schema="questions"]').click({ force: true });
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/08-editor-questions.png` });

// volta
await page.locator('#admin-texts-back').click({ force: true });
await page.waitForTimeout(300);

// Timeline
await page.locator('[data-schema="timeline"]').click({ force: true });
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/09-editor-timeline.png` });

// scroll pra ver primeiro card expandido
await page.evaluate(() => window.scrollBy(0, 400));
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/10-editor-timeline-scrolled.png` });

// volta
await page.locator('#admin-texts-back').click({ force: true });
await page.waitForTimeout(300);

// Coordenadas (reveal)
await page.locator('[data-schema="reveal"]').click({ force: true });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/11-editor-reveal.png` });

// volta + Carta Luana
await page.locator('#admin-texts-back').click({ force: true });
await page.waitForTimeout(300);
await page.locator('[data-schema="card"]').click({ force: true });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/12-editor-card.png` });

// volta + Puzzle
await page.locator('#admin-texts-back').click({ force: true });
await page.waitForTimeout(300);
await page.locator('[data-schema="puzzle"]').click({ force: true });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/13-editor-puzzle.png` });

// recarrega e vai pra tela final pra ver o override aplicado
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

await page.locator('#btn-yes').click({ force: true });
await page.waitForTimeout(7500);
await page.locator('#btn-start').click({ force: true });
await page.waitForTimeout(900);
await page.locator('#btn-hanami-next').click({ force: true });
await page.waitForTimeout(900);

// força ir direto pra tela final via JS pra ver o signature alterado
await page.evaluate(() => {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById('screen-final').classList.add('active');
});
await page.waitForTimeout(500);

// força render do final
await page.evaluate(async () => {
  const m = await import('./js/screens/final.js?ts=' + Date.now());
  // chama o registerScreenEnter manualmente
  const ev = new Event('click');
  // hack: revela todos os parágrafos
});

// melhor: vai pelo fluxo real
await page.evaluate(() => {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
});

// roda full flow forçando rapidamente
await page.evaluate(() => {
  window._fastTest = true;
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// extrai diretamente o signature do FINAL pra confirmar
const finalCheck = await page.evaluate(async () => {
  const m = await import('./js/final-data.js?ts=' + Date.now());
  return m.FINAL.signature;
});
console.log('FINAL.signature após reload:', finalCheck);

// força tela final pra screenshot
await page.evaluate(() => {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById('screen-final').classList.add('active');
});
await page.waitForTimeout(300);

// preenche os elementos do final com os dados (eles só renderizam ao entrar via fluxo)
await page.evaluate(async () => {
  const m = await import('./js/final-data.js?ts=' + Date.now());
  const F = m.FINAL;
  document.getElementById('final-date').textContent = F.date;
  document.getElementById('final-badge').textContent = F.badge;
  document.getElementById('final-signature').textContent = F.signature;
  const body = document.getElementById('final-body');
  body.innerHTML = '';
  if (F.epigraph) {
    const epi = document.createElement('blockquote');
    epi.className = 'final-epigraph final-paragraph revealed';
    epi.innerHTML = `“${F.epigraph.text}”<cite>— ${F.epigraph.author}</cite>`;
    body.appendChild(epi);
  }
  F.paragraphs.forEach((t) => {
    const p = document.createElement('p');
    p.className = 'final-paragraph revealed';
    p.textContent = t;
    body.appendChild(p);
  });
  document.getElementById('final-signature').classList.add('revealed');
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/14-tela-final-com-override.png` });

console.log('\nscreenshots salvos em', OUT);
await browser.close();

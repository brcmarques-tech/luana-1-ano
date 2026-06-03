import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const OUT_DIR = 'scripts/screenshots';
mkdirSync(OUT_DIR, { recursive: true });

const url = process.argv[2] || 'http://localhost:8080';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  ...devices['iPhone 13'],
  hasTouch: true,
});
const page = await ctx.newPage();

await page.goto(url, { waitUntil: 'networkidle' });

// Tela 1: gate
await page.screenshot({ path: `${OUT_DIR}/01-gate.png`, fullPage: false });

// Hover no botão "Não" pra ver ele fugir
await page.locator('#btn-no').hover().catch(() => {});
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT_DIR}/02-gate-no-fugiu.png` });

// Recarrega pra resetar o "Não" e clicar "Sim" sem interferência
await page.reload({ waitUntil: 'networkidle' });
await page.locator('#btn-yes').click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT_DIR}/03-welcome-typing.png` });

// Espera o typing terminar
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT_DIR}/04-welcome-final.png` });

// Avança pra hanami
await page.locator('#btn-start').click();
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT_DIR}/04b-hanami-mid.png` });
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT_DIR}/04c-hanami-full.png` });

// Avança pra timeline
await page.locator('#btn-hanami-next').click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT_DIR}/05-timeline-card1.png` });

// Scroll horizontal pra ver card do meio
const timeline = page.locator('#timeline');
await timeline.evaluate((el) => {
  const cards = el.children;
  cards[6]?.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
});
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT_DIR}/06-timeline-card7.png` });

// Vai pro card final
await timeline.evaluate((el) => {
  const cards = el.children;
  cards[cards.length - 1]?.scrollIntoView({ behavior: 'instant', inline: 'center', block: 'nearest' });
});
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT_DIR}/07-timeline-final.png` });

// Clica em "continuar →" da timeline → vai pra serendipity
await page.locator('#btn-to-loves').click({ force: true });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT_DIR}/08-serendipity.png` });

// Avança da serendipity pra loves
await page.locator('#btn-serendipity-next').click({ force: true });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT_DIR}/08b-loves-top.png` });

// Scroll dentro da loves-scroll pra revelar mais itens
const lovesScroll = page.locator('.loves-scroll');
await lovesScroll.evaluate((el) => { el.scrollTop = el.scrollHeight * 0.4; });
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT_DIR}/09-loves-middle.png` });

await lovesScroll.evaluate((el) => { el.scrollTop = el.scrollHeight; });
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT_DIR}/10-loves-bottom.png` });

// Vai pro jogo
await page.locator('#btn-to-game').click({ force: true });
await page.waitForSelector('#screen-game.active', { timeout: 5000 });
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT_DIR}/11-game-board.png` });

// Clica em 2 cartas pra mostrar o flip
await page.waitForSelector('.memory-card', { state: 'visible', timeout: 10000 });
const cards = page.locator('.memory-card');
await cards.nth(0).click({ force: true });
await page.waitForTimeout(200);
await cards.nth(5).click({ force: true });
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT_DIR}/12-game-flip.png` });

// Força estado de vitória pra ver o overlay
await page.evaluate(() => {
  document.querySelectorAll('.memory-card').forEach((c) => {
    c.classList.add('flipped', 'matched');
  });
  document.getElementById('game-pairs').textContent = '6/6';
  document.getElementById('game-moves').textContent = '8';
  const overlay = document.getElementById('game-win');
  overlay.hidden = false;
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT_DIR}/13-game-win.png` });

// Vai pro puzzle (game → puzzle → card → final)
await page.locator('#btn-to-final').click({ force: true });
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT_DIR}/13b-puzzle.png` });

// Força vitória no puzzle
await page.evaluate(() => {
  const overlay = document.getElementById('puzzle-win');
  if (overlay) overlay.hidden = false;
});
await page.waitForTimeout(400);
await page.locator('#puzzle-win-btn').click({ force: true });
await page.waitForSelector('#screen-card.active', { timeout: 5000 });
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT_DIR}/13c-card-deck.png` });

// Desbloqueia primeira carta do deck pra mostrar o botão
await page.evaluate(() => {
  const first = document.querySelector('.deck-card--locked');
  if (first) {
    first.classList.replace('deck-card--locked', 'deck-card--unlocked');
    first.click();
  }
  const nextBtn = document.getElementById('btn-deck-next');
  if (nextBtn) { nextBtn.classList.remove('deck-hidden'); nextBtn.classList.add('deck-show'); }
});
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT_DIR}/13d-card-deck-flipped.png` });

// Avança pra carta principal da Luana
await page.locator('#btn-deck-next').click({ force: true });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT_DIR}/13e-card-luana.png` });

// Vai pra tela final
await page.locator('#btn-card-next').click({ force: true });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT_DIR}/14-final-header.png` });

// Espera os parágrafos aparecerem em cascata
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT_DIR}/15-final-mid.png` });

// Espera todos os parágrafos + signature + botão restart
await page.waitForTimeout(5500);
const finalScroll = page.locator('.final-scroll');
await finalScroll.evaluate((el) => { el.scrollTop = el.scrollHeight; });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT_DIR}/16-final-bottom.png` });

await browser.close();
console.log('Screenshots saved to', OUT_DIR);

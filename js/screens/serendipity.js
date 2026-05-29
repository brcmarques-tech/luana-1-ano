// TELA: serendipity (偶然の美 — pausa entre timeline e loves).
// Triplo toque no kanji ativa easter egg #4 mobile.

import { goToScreen, registerScreenEnter } from '../nav.js';
import { spawnConfetti } from '../confetti.js';
import { triggerEgg4Mobile } from '../easter-eggs.js';

const render = () => {
  const btn = document.getElementById('btn-serendipity-next');
  if (!btn || btn.dataset.wired) return;
  btn.dataset.wired = '1';
  btn.addEventListener('click', () => goToScreen('loves'));

  const kanji = document.querySelector('.serendipity-kanji');
  if (kanji && !kanji.dataset.eggWired) {
    kanji.dataset.eggWired = '1';
    let taps = 0, tapTimer;
    kanji.addEventListener('click', () => {
      taps++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { taps = 0; }, 700);
      if (taps >= 3) {
        taps = 0;
        triggerEgg4Mobile(spawnConfetti);
      }
    });
  }
};

export const initSerendipity = () => {
  registerScreenEnter('serendipity', render);
};

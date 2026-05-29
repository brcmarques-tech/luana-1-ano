// TELA: hanami (花見 — pausa contemplativa).
// Inicia sakura e esconde pets enquanto a tela está ativa.

import { goToScreen, registerScreenEnter } from '../nav.js';
import { startSakura, hidePets, clearSkullMode } from '../ambient.js';

export const initHanami = () => {
  document.getElementById('btn-hanami-next')?.addEventListener('click', () => {
    goToScreen('journey');
  });

  registerScreenEnter('hanami', () => {
    startSakura();
    hidePets();
    clearSkullMode();
  });
};

// Botão ✦ flutuante: leva pra tela da Constelação.
// Pulsa quando há pergunta nova disponível pro dia atual.

import { goToScreen, getCurrentScreen } from '../nav.js';
import { initConstellation, getStatus } from './data.js';

let _previousScreen = null;
export const getPreviousScreen = () => _previousScreen || 'gate';

export const initSkyButton = async () => {
  const btn = document.createElement('button');
  btn.id = 'btn-sky';
  btn.className = 'btn-sky';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'constelação');
  btn.innerHTML = '<span class="sky-icon">✦</span><span class="sky-badge" id="sky-badge" hidden></span>';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    const cur = getCurrentScreen();
    if (cur && cur !== 'constellation') _previousScreen = cur;
    goToScreen('constellation');
  });

  await initConstellation();
  const refresh = () => {
    const s = getStatus();
    const badge = document.getElementById('sky-badge');
    if (s.complete) {
      btn.classList.add('btn-sky--done');
      badge.hidden = true;
    } else if (s.canAnswerToday) {
      btn.classList.add('btn-sky--pulse');
      badge.hidden = false;
      badge.textContent = `${s.day}/7`;
    } else {
      btn.classList.remove('btn-sky--pulse');
      badge.hidden = false;
      badge.textContent = `${s.answered}/7`;
    }
  };
  refresh();
  // refresh quando volta da tela
  setInterval(refresh, 30000);
};

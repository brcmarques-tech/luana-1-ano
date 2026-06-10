// TELA: final — mensagem em cascata + chuva de corações.
// O botão de restart reseta todos os screens via callback.

import { FINAL } from '../final-data.js';
import { goToScreen, registerScreenEnter, registerScreenExit } from '../nav.js';
import { unlock } from '../achievements.js';
import { setupEggFinalHeart } from '../easter-eggs.js';
import { spawnConfetti } from '../confetti.js';
import { revealCard } from '../card-reveal.js';
import { openProfilePanel } from '../hud.js';
import { CARD } from '../card-data.js';

let dateEl, badgeEl, bodyEl, sigEl, restartBtn, heartsEl;
let rendered = false;
let heartsInterval = null;
let onRestart = null;

const startHearts = () => {
  stopHearts();
  const drop = () => {
    const heart = document.createElement('div');
    heart.className = 'final-bg-heart';
    heart.textContent = ['💛', '💗', '💛', '🤍'][Math.floor(Math.random() * 4)];
    heart.style.left = (5 + Math.random() * 90) + '%';
    heart.style.bottom = '-20px';
    heart.style.fontSize = (0.9 + Math.random() * 1.2) + 'rem';
    heart.style.animationDuration = (6 + Math.random() * 6) + 's';
    heartsEl.appendChild(heart);
    setTimeout(() => heart.remove(), 12000);
  };
  for (let i = 0; i < 4; i++) setTimeout(drop, i * 600);
  heartsInterval = setInterval(drop, 900);
};

const stopHearts = () => {
  if (heartsInterval) {
    clearInterval(heartsInterval);
    heartsInterval = null;
  }
};

const render = () => {
  if (!rendered) {
    rendered = true;
    unlock('happy-ending');
    setTimeout(() => revealCard(CARD, () => openProfilePanel()), 2000);

    dateEl.textContent  = FINAL.date;
    badgeEl.textContent = FINAL.badge;
    sigEl.textContent   = FINAL.signature;
    restartBtn.textContent = FINAL.restartLabel;

    bodyEl.innerHTML = '';

    // epígrafe literária (se houver)
    if (FINAL.epigraph) {
      const epi = document.createElement('blockquote');
      epi.className = 'final-epigraph final-paragraph';
      epi.innerHTML = `“${FINAL.epigraph.text}”<cite>— ${FINAL.epigraph.author}</cite>`;
      bodyEl.appendChild(epi);
    }

    FINAL.paragraphs.forEach((text) => {
      const p = document.createElement('p');
      p.className = 'final-paragraph';
      p.textContent = text;
      bodyEl.appendChild(p);
    });

    restartBtn.addEventListener('click', () => {
      stopHearts();
      onRestart?.();
      goToScreen('gate');
    });
  }

  const paras = bodyEl.querySelectorAll('.final-paragraph');
  paras.forEach((p, i) => setTimeout(() => p.classList.add('revealed'), 1600 + i * 1100));

  const lastDelay = 1600 + paras.length * 1100;
  setTimeout(() => sigEl.classList.add('revealed'), lastDelay);
  setTimeout(() => restartBtn.classList.add('revealed'), lastDelay + 800);

  startHearts();
};

export const initFinal = ({ onFullRestart }) => {
  dateEl     = document.getElementById('final-date');
  badgeEl    = document.getElementById('final-badge');
  bodyEl     = document.getElementById('final-body');
  sigEl      = document.getElementById('final-signature');
  restartBtn = document.getElementById('btn-final-restart');
  heartsEl   = document.getElementById('final-bg-hearts');
  onRestart  = onFullRestart;

  const heart = document.querySelector('#screen-final .final-heart');
  if (heart) setupEggFinalHeart(heart, spawnConfetti, heartsEl);

  registerScreenEnter('final', render);
  registerScreenExit('final', (next) => {
    if (next !== 'final') stopHearts();
  });
};

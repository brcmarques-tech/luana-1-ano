// Teclado virtual para mobile: aparece um botão flutuante (⌨️).
// Teclas com acento colorido são as que "fazem algo" no sistema — sem dizer o quê.
// Só inicializa em dispositivos touch (pointer: coarse).

import { onLongPress } from './love-letter.js';

const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
];

// letras sempre coloridas: amor + love + luana + bruno
const KEY_ACCENT_BASE = {
  a: 'hsl(200,85%,62%)',
  e: 'hsl(120,65%,58%)',
  l: 'hsl(  0,88%,63%)',
  m: 'hsl(260,78%,68%)',
  n: 'hsl(220,78%,64%)',
  o: 'hsl( 25,90%,62%)',
  r: 'hsl(290,70%,63%)',
  u: 'hsl(170,78%,52%)',
  v: 'hsl( 50,88%,58%)',
};

// letras exclusivas de "desculpa" — só aparecem se algum animal foi morto
const KEY_ACCENT_DESCULPA = {
  c: 'hsl( 80,78%,55%)',
  d: 'hsl(320,78%,62%)',
  p: 'hsl(300,72%,65%)',
  s: 'hsl(150,70%,52%)',
};

const getKeyAccent = () => {
  const killed = JSON.parse(localStorage.getItem('luana_killed_pets') || '[]');
  return killed.length > 0
    ? { ...KEY_ACCENT_BASE, ...KEY_ACCENT_DESCULPA }
    : KEY_ACCENT_BASE;
};

export const initMobileKeyboard = () => {
  if (!window.matchMedia('(pointer: coarse)').matches) return;

  // botão flutuante
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'btn-keyboard';
  toggleBtn.className = 'btn-keyboard';
  toggleBtn.innerHTML = '⌨️';
  toggleBtn.setAttribute('aria-label', 'teclado');
  document.body.appendChild(toggleBtn);

  let kbEl = null;

  const fireKey = (key) => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    );
  };

  const buildKeyboard = () => {
    const kb = document.createElement('div');
    kb.id = 'mobile-keyboard';
    kb.className = 'mobile-keyboard';

    kb.innerHTML = ROWS.map((row) => `
      <div class="kb-row">
        ${row.map((k) => {
          const accent = getKeyAccent()[k];
          const style  = accent ? ` style="--ka:${accent}"` : '';
          const cls    = accent ? ' kb-key--accent' : '';
          return `<button class="kb-key${cls}" data-key="${k}"${style}>${k.toUpperCase()}</button>`;
        }).join('')}
      </div>`
    ).join('');

    kb.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.kb-key');
      if (!btn) return;
      e.preventDefault();
      fireKey(btn.dataset.key);
      btn.classList.add('kb-key--tap');
      setTimeout(() => btn.classList.remove('kb-key--tap'), 130);
    });

    return kb;
  };

  const open = () => {
    kbEl = buildKeyboard();
    document.body.appendChild(kbEl);
    requestAnimationFrame(() => kbEl.classList.add('show'));
    toggleBtn.classList.add('kb-open');
  };

  const close = () => {
    if (!kbEl) return;
    kbEl.classList.remove('show');
    const el = kbEl;
    kbEl = null;
    setTimeout(() => el.remove(), 300);
    toggleBtn.classList.remove('kb-open');
  };

  toggleBtn.addEventListener('click', () => {
    kbEl ? close() : open();
  });
};

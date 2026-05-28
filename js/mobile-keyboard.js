// Teclado virtual para mobile: aparece um botão flutuante (⌨️).
// Teclas com acento colorido são as que "fazem algo" no sistema — sem dizer o quê.
// Só inicializa em dispositivos touch (pointer: coarse).

import { onLongPress } from './love-letter.js';

const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
];

// pink = letras de "love", gold = letras únicas de "luana", blue = letras únicas de "admin"
const KEY_ACCENT = {
  l: '#ff5e8a', o: '#ff5e8a', v: '#ff5e8a', e: '#ff5e8a',
  a: '#ffd93d', u: '#ffd93d', n: '#ffd93d',
  d: '#3da5d9', m: '#3da5d9', i: '#3da5d9',
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
          const accent = KEY_ACCENT[k];
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

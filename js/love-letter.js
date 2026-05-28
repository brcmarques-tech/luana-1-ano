// Easter egg: digitar "love" em qualquer tela abre uma carta surpresa.
// Debounce de 500ms para não colidir com "loveadmin".

const LOVE_MESSAGE = `Oi, Lu 💛

se você digitou "love" foi porque
sabia que eu deixei algo aqui...

e deixei mesmo.

eu te amo muito — da forma mais
honesta e completa que conheço.

obrigado por esse ano.
obrigado por cada dia.

— Bruno 🌸`;

const onLongPress = (el, ms, cb) => {
  let t = null;
  el.addEventListener('pointerdown', () => { t = setTimeout(cb, ms); });
  el.addEventListener('pointerup',   () => clearTimeout(t));
  el.addEventListener('pointerleave',() => clearTimeout(t));
  el.addEventListener('pointermove', () => clearTimeout(t));
};

export const initLoveLetter = () => {
  // teclado físico: digitar "love" (com debounce pra não colidir com "loveadmin")
  let buf = '';
  let timer = null;

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (!e.key || e.key.length !== 1) return;

    buf += e.key.toLowerCase();
    if (buf.length > 9) buf = buf.slice(-9);

    clearTimeout(timer);

    if (buf.endsWith('love')) {
      timer = setTimeout(() => {
        if (!buf.endsWith('loveadmin')) {
          buf = '';
          openLoveLetter();
        }
      }, 500);
    }
  });

  // mobile: segurar o avatar do HUD por 1.5s
  const tryWireAvatar = () => {
    const avatar = document.getElementById('hud-avatar');
    if (avatar) {
      onLongPress(avatar, 1500, openLoveLetter);
    } else {
      setTimeout(tryWireAvatar, 500);
    }
  };
  tryWireAvatar();
};

export { onLongPress };

const openLoveLetter = () => {
  if (document.getElementById('love-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'love-overlay';
  overlay.className = 'love-overlay';
  overlay.innerHTML = `
    <div class="love-scene">
      <div class="love-envelope" id="love-envelope">
        <div class="love-env-flap" id="love-flap"></div>
        <div class="love-env-body">
          <div class="love-env-seal">💌</div>
        </div>
      </div>
      <div class="love-letter" id="love-letter">
        <div class="love-letter-lines"></div>
        <p class="love-letter-text">${LOVE_MESSAGE.replace(/\n/g, '<br>')}</p>
      </div>
      <button class="love-close-btn" id="love-close">fechar ✕</button>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  // abre a aba do envelope
  setTimeout(() => {
    document.getElementById('love-flap')?.classList.add('open');
  }, 900);

  // carta sobe
  setTimeout(() => {
    document.getElementById('love-letter')?.classList.add('rise');
  }, 1600);

  // botão fechar aparece
  setTimeout(() => {
    document.getElementById('love-close')?.classList.add('visible');
  }, 2400);

  document.getElementById('love-close').addEventListener('click', () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 400);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 400);
    }
  });
};

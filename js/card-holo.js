// Efeito holográfico iridescente para cards TCG.
// Atualiza CSS custom properties no elemento pai (card) via pointermove e deviceorientation.
// O CSS usa essas vars para animar o foil, glow especular e textura de ruído.

export const applyHoloTilt = (cardEl, withGyro = false) => {
  if (!cardEl) return;

  const update = (px, py) => {
    const r = cardEl.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (px - r.left) / r.width));
    const y = Math.max(0, Math.min(1, (py - r.top) / r.height));
    const rx = (y - 0.5) * -22;
    const ry = (x - 0.5) * 22;
    cardEl.style.transform   = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    cardEl.style.setProperty('--foil-rot',  `${(ry * 3 + 55).toFixed(1)}deg`);
    cardEl.style.setProperty('--foil-hue',  (x * 180).toFixed(1));
    cardEl.style.setProperty('--shine-x',   `${(x * 100).toFixed(1)}%`);
    cardEl.style.setProperty('--shine-y',   `${(y * 100).toFixed(1)}%`);
    cardEl.style.setProperty('--holo-opacity', '0.5');
  };

  const reset = () => {
    cardEl.style.transform = '';
    cardEl.style.setProperty('--holo-opacity', '0');
  };

  cardEl.addEventListener('mouseenter', () => cardEl.style.setProperty('--holo-opacity', '0.5'));
  cardEl.addEventListener('mouseleave', reset);
  cardEl.addEventListener('pointermove', (e) => update(e.clientX, e.clientY));

  // mobile: marca este card como alvo do giroscópio no toque
  cardEl.addEventListener('touchstart', () => {
    document.querySelectorAll('.card--gyro').forEach((el) => el.classList.remove('card--gyro'));
    cardEl.classList.add('card--gyro');
    cardEl.style.setProperty('--holo-opacity', '0.5');
  }, { passive: true });

  if (withGyro && window.DeviceOrientationEvent) {
    let b0 = null, g0 = null;
    window.addEventListener('deviceorientation', (e) => {
      if (e.beta == null || e.gamma == null) return;
      if (b0 == null) { b0 = e.beta; g0 = e.gamma; return; }
      const target = document.querySelector('.card--gyro') || cardEl;
      const r = target.getBoundingClientRect();
      update(
        r.left + r.width  / 2 + (e.gamma - g0) * 4,
        r.top  + r.height / 2 + (e.beta  - b0) * 4,
      );
    }, true);
  }
};

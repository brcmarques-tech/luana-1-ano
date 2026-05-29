// TELA: locked — countdown grandão até o próximo aniversário.
// Não usa nav.goToScreen pra exibir (chamada direta no boot quando sessão expira).

export const showLockedScreen = (nextUnlock) => {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const screen = document.getElementById('screen-locked');
  if (!screen) return;
  screen.classList.add('active');

  const daysEl  = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl  = document.getElementById('cd-mins');
  const secsEl  = document.getElementById('cd-secs');

  const pad = (n, len = 2) => String(n).padStart(len, '0');

  const tick = () => {
    const diff = nextUnlock - Date.now();
    if (diff <= 0) { location.reload(); return; }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);
    daysEl.textContent  = pad(days, 3);
    hoursEl.textContent = pad(hours);
    minsEl.textContent  = pad(mins);
    secsEl.textContent  = pad(secs);
  };

  tick();
  setInterval(tick, 1000);
};

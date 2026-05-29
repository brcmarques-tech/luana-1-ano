// Transições anime entre telas — speed lines + flash + texto impacto

const IMPACT_TEXTS = {
  welcome: 'oi!',
  hanami: '花',
  journey: 'go!',
  loves: '♡♡♡',
  game: 'play!',
  puzzle: 'fit!',
  card: 'ssr!',
  final: 'fim?',
};

let transitioning = false;

export const animeTransition = (targetScreen) => new Promise((resolve) => {
  if (transitioning) {
    resolve();
    return;
  }
  transitioning = true;

  const overlay = document.createElement('div');
  overlay.className = 'anime-transition';
  overlay.innerHTML = `
    <div class="speed-lines"></div>
    <div class="flash"></div>
    <div class="impact-text">${IMPACT_TEXTS[targetScreen] || ''}</div>
  `;
  document.body.appendChild(overlay);

  setTimeout(resolve, 280);
  setTimeout(() => {
    overlay.remove();
    transitioning = false;
  }, 750);
});

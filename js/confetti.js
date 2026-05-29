// Spawn de confetes em cima de uma camada fixa (.confetti-layer, fallback body).

const COLORS = ['#ff5e8a', '#ffd93d', '#6bcb77', '#ffffff', '#e0436e'];

export const spawnConfetti = (count = 30) => {
  const layer = document.getElementById('confetti-layer') || document.body;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    piece.style.animationDuration = (2 + Math.random() * 2.5) + 's';
    piece.style.animationDelay = (Math.random() * 0.4) + 's';
    piece.style.width = piece.style.height = (6 + Math.random() * 8) + 'px';
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 5000);
  }
};

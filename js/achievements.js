// Sistema de achievements estilo videogame.
// Toast aparece no canto superior direito ao desbloquear.

export const ACHIEVEMENTS = {
  'first-step': { icon: '👣', name: 'Primeiro passo', desc: 'Você passou pelo portão' },
  'all-cards-seen': { icon: '📅', name: 'Memória do ano', desc: 'Viu todos os 13 meses' },
  'loves-read': { icon: '💌', name: 'Coleção do amor', desc: 'Leu todas as coisas que ele ama' },
  'memory-master': { icon: '🧠', name: 'Memorizadora pro', desc: 'Completou o memory game' },
  'happy-ending': { icon: '✨', name: 'Final feliz', desc: 'Chegou até o fim' },
  'egg-hunter': { icon: '🥚', name: 'Caçadora de segredos', desc: 'Achou um easter egg' },
  'all-eggs': { icon: '🏆', name: 'Lendária', desc: 'Achou os 4 easter eggs' },
  'konami-master': { icon: '🎮', name: 'Hardcore gamer', desc: 'Konami code, sério mesmo?' },
};

const unlocked = new Set();

export const unlock = (id) => {
  if (unlocked.has(id)) return false;
  const ach = ACHIEVEMENTS[id];
  if (!ach) return false;
  unlocked.add(id);
  showAchievementToast(ach);
  return true;
};

export const isUnlocked = (id) => unlocked.has(id);
export const unlockedCount = () => unlocked.size;

const showAchievementToast = (ach) => {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="achievement-icon">${ach.icon}</div>
    <div class="achievement-body">
      <div class="achievement-label">CONQUISTA DESBLOQUEADA</div>
      <div class="achievement-name">${ach.name}</div>
      <div class="achievement-desc">${ach.desc}</div>
    </div>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 600);
  }, 3200);
};

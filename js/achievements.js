// Sistema de achievements estilo videogame.
// Toast aparece no canto superior direito ao desbloquear.
// Conquistas são salvas no localStorage via progress.js.

import { saveAchievements, loadAchievements } from './progress.js';
import { haptic, HAPTIC } from './haptic.js';
import { revealCard } from './card-reveal.js';
import { SPECIAL_CARD, BONUS_CARDS } from './card-data.js';

const CARD_BY_TRIGGER = {
  'animal-killer': () => BONUS_CARDS.find(c => c.id === 'momoa'),
  'genocide':      () => BONUS_CARDS.find(c => c.id === 'endiabrada'),
  'beginning':     () => BONUS_CARDS.find(c => c.id === 'moira'),
  'all-eggs':      () => SPECIAL_CARD,
};

let _allEggsCallback = null;
export const onAllEggsUnlocked = (cb) => { _allEggsCallback = cb; };

export const ACHIEVEMENTS = {
  'first-step':    { icon: '👣', name: 'Primeiro passo',       desc: 'Você passou pelo portão' },
  'stubborn':      { icon: '😤', name: 'Chata insistente',     desc: 'Clicou no Não até ele sumir' },
  'all-cards-seen':{ icon: '📅', name: 'Memória do ano',       desc: 'Viu todos os 13 meses' },
  'loves-read':    { icon: '💌', name: 'Coleção do amor',      desc: 'Leu todas as coisas que ele ama' },
  'memory-master': { icon: '🧠', name: 'Memorizadora pro',     desc: 'Completou o memory game' },
  'happy-ending':  { icon: '✨', name: 'Final feliz',           desc: 'Chegou até o fim' },
  'egg-hunter':    { icon: '🥚', name: 'Caçadora de segredos', desc: 'Achou um easter egg' },
  'all-eggs':      { icon: '🏆', name: 'Lendária',             desc: 'Achou os 5 easter eggs' },
  'konami-master': { icon: '🎮', name: 'Hardcore gamer',       desc: 'Konami code, sério mesmo?' },
  'animal-killer':  { icon: '☠️',  name: 'Assassina de bichinho', desc: 'Matou um animal inocente' },
  'animal-forgiver':{ icon: '🕊️', name: 'Redentora',             desc: 'Pediu desculpa pros bichinhos' },
  'genocide':       { icon: '💀',  name: 'Endiabrada',              desc: 'Matou todos os bichinhos inocentes' },
  'beginning':      { icon: '🌌',  name: 'Início de tudo',         desc: 'Acendeu todas as estrelas — e descobriu onde tudo começou' },
  'puzzle-master':  { icon: '🧩',  name: 'Montadora',              desc: 'Montou a foto inteira' },
  'balloon-popper': { icon: '🎈',  name: 'Estoura-tudo',           desc: 'Estourou 20 balões de memória' },
};

// restaura conquistas salvas
const unlocked = loadAchievements();

export const unlock = (id) => {
  if (unlocked.has(id)) return false;
  const ach = ACHIEVEMENTS[id];
  if (!ach) return false;
  unlocked.add(id);
  saveAchievements(unlocked);
  showAchievementToast(ach);
  haptic(id === 'all-eggs' ? HAPTIC.special : HAPTIC.achievement);
  if (id === 'all-eggs' && _allEggsCallback) setTimeout(_allEggsCallback, 700);
  const cardGetter = CARD_BY_TRIGGER[id];
  if (cardGetter) setTimeout(() => revealCard(cardGetter()), 1200);
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

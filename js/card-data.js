// Carta principal da Luana + baralho de família e pets

export const CARD = {
  name: 'Luana Telles Melgarejo',
  title: 'A Esposa Lendária',
  type: 'Criatura · Humana · Amada',
  rarity: '★★★★★',
  level: 'Lv. 1 ano',
  emoji: '🌸',
  photoKey: 'card-luana',
  gradient: 'linear-gradient(135deg, #2a1448 0%, #1a0a2e 50%, #3a1f5c 100%)',
  border: 'linear-gradient(135deg, #ffd93d 0%, #ff5e8a 50%, #ffd93d 100%)',

  stats: [
    { label: 'AMOR',  value: 999, color: '#ff5e8a' },
    { label: 'COMP',  value:  98, color: '#6bcb77' },
    { label: 'INT',   value:  10, color: '#3da5d9' },
    { label: 'CARI',  value: 100, color: '#ffd93d' },
  ],

  abilities: [
    {
      icon: '☕',
      name: 'Café Salvador',
      desc: 'Traz café sem ser pedido. Restaura +50 HP do Bruno por turno.',
    },
    {
      icon: '🛌',
      name: 'Abraço de 8 Horas',
      desc: 'Aplica calor + paz no aliado por toda a noite. Imune a desfazer.',
    },
    {
      icon: '✨',
      name: 'Sorriso Crítico',
      desc: 'Causa dano emocional fatal em quem olha. Sem contra.',
    },
  ],

  flavor: '"se um ano é assim, imagina dez."',
};

// 6 cartas do baralho — 1 por conquista
export const BONUS_CARDS = [
  {
    achievementKey: 'first-step',
    name: 'A Esposa',
    title: 'Dona da Casa e do Coração',
    type: 'Criatura · Humana · Caótica',
    rarity: '★★★★★',
    emoji: '🌸',
    photoKey: 'card-luana-2',
    gradient: 'linear-gradient(135deg, #2a1448 0%, #3a1f5c 100%)',
    border: 'linear-gradient(135deg, #ffd93d 0%, #ff5e8a 100%)',
    stats: [
      { label: 'AMOR',  value: 999, color: '#ff5e8a' },
      { label: 'CARI',  value: 100, color: '#ffd93d' },
      { label: 'INT',   value:  10, color: '#3da5d9' },
    ],
    abilities: [
      { icon: '🌸', name: 'Beleza Fatal', desc: 'Qualquer inimigo esquece o que ia fazer.' },
    ],
    flavor: '"inteligência: suspeita. coração: incontestável."',
  },
  {
    achievementKey: 'all-cards-seen',
    name: 'A Rainha Distante',
    title: 'Felina Suprema da Casa',
    type: 'Criatura · Felino · Mandona',
    rarity: '★★★☆☆',
    emoji: '🐱',
    photoKey: 'card-gata',
    gradient: 'linear-gradient(135deg, #1a1a0a 0%, #2d2210 100%)',
    border: 'linear-gradient(135deg, #ffd93d 0%, #ff8c00 100%)',
    stats: [
      { label: 'BRAVA', value:  98, color: '#ff8c00' },
      { label: 'FOFO',  value:  95, color: '#ffd93d' },
      { label: 'INT',   value:   3, color: '#3da5d9' },
    ],
    abilities: [
      { icon: '🐾', name: 'Derrubou Meu Copo', desc: 'Olhou nos olhos e jogou. Só porque podia.' },
    ],
    flavor: '"fodona? sim. burra? também."',
  },
  {
    achievementKey: 'loves-read',
    name: 'O Nobre Misterioso',
    title: 'Felino de Poucas Palavras',
    type: 'Criatura · Felino · Distante',
    rarity: '★★★★☆',
    emoji: '😺',
    photoKey: 'card-gato',
    gradient: 'linear-gradient(135deg, #0a1a2a 0%, #102030 100%)',
    border: 'linear-gradient(135deg, #3da5d9 0%, #9b59b6 100%)',
    stats: [
      { label: 'ESTILO', value:  95, color: '#3da5d9' },
      { label: 'FOFO',   value:  90, color: '#9b59b6' },
      { label: 'LIGAN',  value:   5, color: '#6bcb77' },
    ],
    abilities: [
      { icon: '😺', name: 'Indiferença Real', desc: 'Recebeu carinho, virou as costas. Com classe.' },
    ],
    flavor: '"ele é fodão. mas não liga pra isso."',
  },
  {
    achievementKey: 'memory-master',
    name: 'O Guardião Fiel',
    title: 'Melhor Amigo Certificado',
    type: 'Criatura · Canino · Leal',
    rarity: '★★★★☆',
    emoji: '🐕',
    photoKey: 'card-dog1',
    gradient: 'linear-gradient(135deg, #1a1000 0%, #2a1800 100%)',
    border: 'linear-gradient(135deg, #ffd93d 0%, #6bcb77 100%)',
    stats: [
      { label: 'LEAL',  value: 100, color: '#ffd93d' },
      { label: 'ENERG', value:  97, color: '#6bcb77' },
      { label: 'FARO',  value:  90, color: '#ff8c00' },
    ],
    abilities: [
      { icon: '🐕', name: 'Late Feliz', desc: 'Quando você chega em casa. Todo. Santo. Dia.' },
    ],
    flavor: '"esse aí é fodão. de verdade."',
  },
  {
    achievementKey: 'happy-ending',
    name: 'A Especialista em Nada',
    title: 'Campeã de Tropeços',
    type: 'Criatura · Canina · Caótica Neutra',
    rarity: '★★☆☆☆',
    emoji: '🐶',
    photoKey: 'card-dog2',
    gradient: 'linear-gradient(135deg, #1a0a1a 0%, #2a1020 100%)',
    border: 'linear-gradient(135deg, #ff5e8a 0%, #ffd93d 100%)',
    stats: [
      { label: 'CARIS', value: 100, color: '#ff5e8a' },
      { label: 'ENERG', value: 999, color: '#ffd93d' },
      { label: 'INT',   value:  12, color: '#3da5d9' },
    ],
    abilities: [
      { icon: '🐾', name: 'Tropeçou na Própria Pata', desc: 'Causou 0 de dano. Causou 100 de graça.' },
    ],
    flavor: '"pateta pro nível expert."',
  },
  {
    achievementKey: 'egg-hunter',
    name: 'A Dorminhoca Infinita',
    title: 'Especialista em Fazer Nada',
    type: 'Criatura · Canina · Confusa',
    rarity: '★★☆☆☆',
    emoji: '🐾',
    photoKey: 'card-dog3',
    gradient: 'linear-gradient(135deg, #0a0a1a 0%, #101028 100%)',
    border: 'linear-gradient(135deg, #9b59b6 0%, #3da5d9 100%)',
    stats: [
      { label: 'FOFO',  value: 100, color: '#9b59b6' },
      { label: 'SONO',  value: 100, color: '#3da5d9' },
      { label: 'INT',   value:   8, color: '#6bcb77' },
    ],
    abilities: [
      { icon: '💤', name: 'Latiu Pra Parede', desc: 'Ninguém sabe o porquê. Ela também não.' },
    ],
    flavor: '"confusa, fofa e completamente inútil. perfeita."',
  },
];

// carta especial — desbloqueada ao encontrar os 4 easter eggs
export const SPECIAL_CARD = {
  achievementKey: 'all-eggs',
  name: 'O Homem Mais Sortudo do Mundo',
  title: 'Marido de Lenda',
  type: 'Mítica · Humano · Comediante',
  rarity: '★★★★★★',
  emoji: '😂',
  photoKey: 'card-bruno',
  gradient: 'linear-gradient(135deg, #1a1000 0%, #2a1a00 50%, #1a1000 100%)',
  border: 'linear-gradient(135deg, #ffd700 0%, #ffec6e 25%, #ffd700 50%, #ffec6e 75%, #ffd700 100%)',
  isSpecial: true,
  stats: [
    { label: 'SORTE',   value: 999, color: '#ffd700' },
    { label: 'COMÉDIA', value: 100, color: '#ffec6e' },
    { label: 'INT',     value: 100, color: '#3da5d9' },
    { label: 'ATQ',     value:   5, color: '#ff5e8a' },
    { label: 'DEF',     value:   3, color: '#6bcb77' },
  ],
  abilities: [
    { icon: '🍀', name: 'Sortudo Demais', desc: 'Casou com a Luana. +999 em tudo só por isso.' },
    { icon: '😂', name: 'Comédia Passiva', desc: 'Faz ela rir mesmo sem querer. Habilidade inata.' },
  ],
  flavor: '"a sorte? é por ter ela."',
};

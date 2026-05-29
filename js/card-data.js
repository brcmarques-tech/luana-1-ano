// Carta principal da Luana + baralho de pets + carta secreta do Bruno

export const CARD = {
  name: 'Luana Telles Melgarejo',
  title: 'A Deusa Acidental',
  type: 'Criatura · Humana · Divina · Confusa',
  rarity: '★★★★★',
  level: 'Lv. 1 ano',
  emoji: '🌸',
  photoKey: 'card-luana',
  gradient: 'linear-gradient(135deg, #2a1448 0%, #1a0a2e 50%, #3a1f5c 100%)',
  border: 'linear-gradient(135deg, #ffd93d 0%, #ff5e8a 50%, #ffd93d 100%)',

  stats: [
    { label: 'AMOR',    value: 999, color: '#ff5e8a' },
    { label: 'BELEZA',  value: 100, color: '#ffd93d' },
    { label: 'CARINHO', value: 100, color: '#6bcb77' },
    { label: 'INT',     value:  12, color: '#3da5d9' },
  ],

  abilities: [
    {
      icon: '☕',
      name: 'Café Salvador',
      desc: 'Traz café sem ser pedido. Restaura +50 HP do Bruno por turno.',
    },
    {
      icon: '✨',
      name: 'Sorriso Crítico',
      desc: 'Causa dano emocional fatal em quem olha. Sem contra.',
    },
    {
      icon: '🙃',
      name: 'Pergunta Filosófica',
      desc: 'Faz perguntas tipo "por que o céu é azul?" às 23h. Aliados confusos mas apaixonados.',
    },
  ],

  flavor: '"perfeita em tudo, exceto em saber disso."',
};

// 4 cartas de pets — 1 por conquista
export const BONUS_CARDS = [
  {
    achievementKey: 'first-step',
    name: 'Wolf',
    title: 'Sir Wolf, o Parceiro Alfa',
    subtitle: 'Guardião do Sofá e da Brotherhood',
    type: 'Criatura · Canino · Alfa · Leal',
    rarity: '★★★★☆',
    emoji: '🐺',
    photoKey: 'card-dog2',
    gradient: 'linear-gradient(135deg, #0d1117 0%, #1a2233 100%)',
    border: 'linear-gradient(135deg, #3da5d9 0%, #1a5f7a 100%)',
    stats: [
      { label: 'PARCERIA', value: 100, color: '#3da5d9' },
      { label: 'FORÇA',    value:  95, color: '#6bcb77' },
      { label: 'LEAL',     value:  99, color: '#ffd93d' },
      { label: 'FARO',     value:  88, color: '#ff8c00' },
    ],
    abilities: [
      { icon: '🐺', name: 'Pacto de Irmandade', desc: 'Sente quando o Bruno tá mal-humorado antes de qualquer um. Buff de presença permanente.' },
      { icon: '💪', name: 'Postura de Alfa', desc: 'Só de existir, intimida. Passiva permanente.' },
    ],
    flavor: '"ele não late pra nada. ele late pra você."',
  },
  {
    achievementKey: 'all-cards-seen',
    name: 'Moira',
    title: 'Moira, a Tsundere Cósmica',
    subtitle: 'Guardiã do Afeto Relutante',
    type: 'Criatura · Felina · Tsundere · Mandona',
    rarity: '★★★★☆',
    emoji: '😾',
    photoKey: 'card-gata',
    gradient: 'linear-gradient(135deg, #1a0a0a 0%, #2d1010 100%)',
    border: 'linear-gradient(135deg, #ff5e8a 0%, #9b59b6 100%)',
    stats: [
      { label: 'BRIGA',   value:  98, color: '#ff5e8a' },
      { label: 'ORGULHO', value: 100, color: '#9b59b6' },
      { label: 'CARINHO', value:  95, color: '#ffd93d' },
      { label: 'RONRON',  value:  80, color: '#6bcb77' },
    ],
    abilities: [
      { icon: '😾', name: 'Ataque Não Solicitado', desc: 'Arranha sem aviso. Dano aleatório. Sem remorso.' },
      { icon: '🥺', name: 'Carinho Secreto', desc: 'Deita do lado quando ninguém tá olhando. Efeito: aquece o coração.' },
    ],
    flavor: '"ela briga. mas tá sempre perto."',
  },
  {
    achievementKey: 'loves-read',
    name: 'Jairo',
    title: 'Jairo, o Bonitão Existencial',
    subtitle: 'O Adolescente Eterno',
    type: 'Criatura · Felino · Neutro · Estiloso',
    rarity: '★★★☆☆',
    emoji: '😏',
    photoKey: 'card-gato',
    gradient: 'linear-gradient(135deg, #0a1a2a 0%, #102030 100%)',
    border: 'linear-gradient(135deg, #3da5d9 0%, #9b59b6 100%)',
    stats: [
      { label: 'ESTILO',  value:  95, color: '#3da5d9' },
      { label: 'BELEZA',  value:  90, color: '#9b59b6' },
      { label: 'PERS.',   value:  15, color: '#ffd93d' },
      { label: 'LIGA',    value:   8, color: '#6bcb77' },
    ],
    abilities: [
      { icon: '😏', name: 'Indiferença Calculada', desc: 'Recebe carinho, pisca uma vez. Dano emocional: 0. Charme: 100.' },
      { icon: '🪞', name: 'Beleza Sem Esforço', desc: 'Passiva. Só existe e já é bonito.' },
    ],
    flavor: '"não faz nada. faz tudo com estilo."',
  },
  {
    achievementKey: 'memory-master',
    name: 'Winter',
    title: 'Winter, a Alma Pura da Família',
    subtitle: 'Campeã Olímpica do Tropeço',
    type: 'Criatura · Canina · Caótica · Felizarda',
    rarity: '★★★☆☆',
    emoji: '🐶',
    photoKey: 'card-dog1',
    gradient: 'linear-gradient(135deg, #1a0a1a 0%, #2a1020 100%)',
    border: 'linear-gradient(135deg, #ff5e8a 0%, #ffd93d 100%)',
    stats: [
      { label: 'FELIZ',  value: 999, color: '#ffd93d' },
      { label: 'AMOR',   value: 100, color: '#ff5e8a' },
      { label: 'ENERG',  value:  98, color: '#6bcb77' },
      { label: 'INT',    value:  10, color: '#3da5d9' },
    ],
    abilities: [
      { icon: '🏃', name: 'Corrida Sem Destino', desc: 'Corre em círculos por 30 segundos. Motivo desconhecido. Energia: infinita.' },
      { icon: '🤩', name: 'Animação Perpétua', desc: 'Fica feliz com absolutamente tudo. Habilidade passiva.' },
    ],
    flavor: '"nem sempre sabe o que tá fazendo. sempre sabe que te ama."',
  },
];

// carta secreta do Bruno — desbloqueada ao encontrar todos os easter eggs
export const SPECIAL_CARD = {
  achievementKey: 'all-eggs',
  name: 'Bruno Marques',
  title: 'O Agraciado Involuntário',
  subtitle: 'Homem de Sorte Imerecida',
  type: 'Mítica · Humano · Comediante · Abençoado',
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
    { icon: '🍀', name: 'Sortudo Demais', desc: 'Casou com a Luana. +999 em tudo só por isso. Habilidade inata e imerecida.' },
    { icon: '😂', name: 'Comédia Passiva', desc: 'Faz ela rir mesmo sem querer. Não tem controle disso.' },
    { icon: '💔', name: 'Ruim em Tudo', desc: '-95 em todas as habilidades técnicas. A Luana compensa.' },
  ],
  flavor: '"a sorte? é por ter ela."',
};

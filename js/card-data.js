// Carta TCG/gacha da Luana. Edite as stats e habilidades como quiser.

export const CARD = {
  name: 'Luana Telles Melgarejo',
  title: 'A Esposa Lendária',
  type: 'Criatura · Humana · Amada',
  rarity: '★★★★★',
  level: 'Lv. 1 ano',

  stats: [
    { label: 'AMOR',  value: 999, color: '#ff5e8a' },
    { label: 'COMP',  value:  98, color: '#6bcb77' },
    { label: 'INT',   value:  95, color: '#3da5d9' },
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

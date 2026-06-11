// Edite aqui os 13 cards da timeline (jun/25 → jun/26).
// (também editável pelo painel admin > Textos)

import { applyOverride } from './content-overrides.js';

const DEFAULT = [
  {
    date: 'JUN 2025',
    caption: 'onde tudo começou 💫',
    photo: 'assets/img/timeline-01.jpg',
    quotes: [
      { text: 'Eu te amo como se amam certas coisas obscuras, secretamente, entre a sombra e a alma.', source: 'Pablo Neruda — Soneto XVII' },
      { text: 'Quero fazer com você o que a primavera faz com as flores.', source: 'Pablo Neruda — Vinte Poemas de Amor' },
      { text: 'Posso escrever os versos mais tristes esta noite. Eu a amei, e às vezes ela também me amava.', source: 'Pablo Neruda — Vinte Poemas de Amor' },
    ],
  },
  {
    date: 'JUL 2025',
    caption: 'o mês que você me fez um aniversário pífio 😂',
    photo: 'assets/img/timeline-02.jpg',
    quotes: [
      { text: 'Tu te tornas eternamente responsável por aquilo que cativas.', source: 'Antoine de Saint-Exupéry — O Pequeno Príncipe' },
      { text: 'O amor não é olhar um para o outro, é olhar juntos na mesma direção.', source: 'Antoine de Saint-Exupéry — Terra dos Homens' },
      { text: 'Só se vê bem com o coração. O essencial é invisível para os olhos.', source: 'Antoine de Saint-Exupéry — O Pequeno Príncipe' },
    ],
  },
  {
    date: 'AGO 2025',
    caption: 'nosso amor não para de crescer 💛',
    photo: 'assets/img/timeline-03.jpg',
    quotes: [
      { text: 'Ficou tão desconcertado com o amor que não conseguiu nem dormir, nem comer, nem falar — e aquilo o fez mais bonito do que nunca.', source: 'Gabriel García Márquez — O Amor nos Tempos do Cólera' },
      { text: 'O segredo de uma boa velhice não é outra coisa que um pacto honrado com a solidão.', source: 'Gabriel García Márquez — Cem Anos de Solidão' },
      { text: 'Nunca perca uma oportunidade de dizer que ama, porque a vida é breve demais e a manhã não é garantida.', source: 'Gabriel García Márquez' },
    ],
  },
  {
    date: 'SET 2025',
    caption: 'pensei que seu cérebro ficaria formado aos 25 — mas ainda tenho esperanças 😂',
    photo: 'assets/img/timeline-04.jpg',
    quotes: [
      { text: 'Sua tarefa não é buscar pelo amor, mas meramente buscar e encontrar todas as barreiras dentro de você que você construiu contra ele.', source: 'Rumi — Masnavi' },
      { text: 'Amor é a ponte entre você e tudo.', source: 'Rumi' },
      { text: 'Onde quer que você esteja, seja a alma daquele lugar.', source: 'Rumi — Masnavi' },
    ],
  },
  {
    date: 'OUT 2025',
    caption: 'planejamos gastar muito mais do que podíamos — e fizemos isso com estilo 💸',
    photo: 'assets/img/timeline-05.jpg',
    quotes: [
      { text: 'Você perfurou minha alma. Estou metade agonia, metade esperança.', source: 'Jane Austen — Persuasão' },
      { text: 'Se eu te amasse menos, poderia falar sobre isso mais.', source: 'Jane Austen — Emma' },
      { text: 'Não posso deixar de pensar em você. Qualquer que seja a tentativa, sinto que você é parte essencial de mim.', source: 'Jane Austen — Persuasão' },
    ],
  },
  {
    date: 'NOV 2025',
    caption: 'Black Friday — uhul! 🛍️',
    photo: 'assets/img/timeline-06.jpg',
    quotes: [
      { text: 'Duvida que as estrelas são fogo; duvida que o sol se move; duvida da verdade, mas nunca duvide do meu amor.', source: 'William Shakespeare — Hamlet' },
      { text: 'Minha generosidade é tão profunda quanto o mar; quanto mais te dou, mais tenho, pois ambos são infinitos.', source: 'William Shakespeare — Romeu e Julieta' },
      { text: 'O curso verdadeiro do amor nunca foi tranquilo.', source: 'William Shakespeare — Sonho de uma Noite de Verão' },
    ],
  },
  {
    date: 'DEZ 2025',
    caption: 'primeiro natal juntos, e agora noivos 💍🎄',
    photo: 'assets/img/timeline-07.jpg',
    quotes: [
      { text: 'Amar é ser vulnerável. Amar qualquer coisa significa que seu coração certamente vai ser partido.', source: 'C.S. Lewis — Os Quatro Amores' },
      { text: 'A amizade nasce no momento em que uma pessoa diz para a outra: "O quê! Você também? Eu pensei que fosse o único."', source: 'C.S. Lewis — Os Quatro Amores' },
      { text: 'O amor não é afeição; é uma coisa implacavelmente permanente.', source: 'C.S. Lewis — Cartas a Malcolm' },
    ],
  },
  {
    date: 'JAN 2026',
    caption: 'o melhor início de ano de todos — porque foi com você 💛',
    photo: 'assets/img/timeline-08.jpg',
    quotes: [
      { text: 'Tudo que eu sei, eu sei por amor.', source: 'Leo Tolstói — Ana Karênina' },
      { text: 'Se você ama alguém, ame-o com toda a sua alma, ou então não ame de jeito nenhum.', source: 'Leo Tolstói' },
      { text: 'Felizes as famílias que se parecem; cada família infeliz o é à sua maneira.', source: 'Leo Tolstói — Ana Karênina' },
    ],
  },
  {
    date: 'FEV 2026',
    caption: 'primeiro carnaval juntos 🎉',
    photo: 'assets/img/timeline-09.jpg',
    quotes: [
      { text: 'O amor é composto de uma única alma habitando dois corpos.', source: 'Aristóteles — Ética a Nicômaco' },
      { text: 'Na origem cada pessoa era um ser completo, e o amor é a busca pela metade perdida.', source: 'Platão — O Banquete' },
      { text: 'O amor é simplesmente o nome para o desejo e a busca pelo todo.', source: 'Platão — O Banquete' },
    ],
  },
  {
    date: 'MAR 2026',
    caption: 'é o nosso início né 💛',
    photo: 'assets/img/timeline-10.jpg',
    quotes: [
      { text: 'Amor é fogo que arde sem se ver; é ferida que dói e não se sente; é um contentamento descontente.', source: 'Luís de Camões — Sonetos' },
      { text: 'Transforma-se o amador na cousa amada, por virtude do muito imaginar.', source: 'Luís de Camões — Sonetos' },
      { text: 'Erros do amor nunca foram erros; neste caso se mostra mais capaz de culpa e de desculpa o amor.', source: 'Luís de Camões — Os Lusíadas' },
    ],
  },
  {
    date: 'ABR 2026',
    caption: 'te ensinei a andar a cavalo 🐴',
    photo: 'assets/img/timeline-11.jpg',
    quotes: [
      { text: 'Ser profundamente amado por alguém nos dá força; amar alguém profundamente nos dá coragem.', source: 'Lao-Tzu — Tao Te Ching' },
      { text: 'Amar a si mesmo é o começo de um romance que dura a vida toda.', source: 'Oscar Wilde — O Retrato de Dorian Gray' },
      { text: 'O coração foi feito para ser partido.', source: 'Oscar Wilde — De Profundis' },
    ],
  },
  {
    date: 'MAI 2026',
    caption: 'obrigado por atravessar esse mês difícil comigo 💛',
    photo: 'assets/img/timeline-12.jpg',
    quotes: [
      { text: 'Você é minha cada manhã e minha casa cada noite.', source: 'Rupi Kaur — Leite e Mel' },
      { text: 'Vou te amar até que meu amor seja razão suficiente para que você se ame também.', source: 'Rupi Kaur — A Sun and Her Flowers' },
      { text: 'Ela é uma flor selvagem que cresceu de entre as pedras, mais dura que qualquer coisa que o mundo tentou plantar.', source: 'Rupi Kaur — Leite e Mel' },
    ],
  },
  {
    date: '17/06/2026',
    caption: '1 ANO',
    photo: null,
    isFinal: true,
    finalText: 'e olha onde a gente chegou 💛',
  },
];

export const TIMELINE = applyOverride('timeline', DEFAULT);

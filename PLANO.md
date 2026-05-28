# Plano dos 21 dias

Hoje é **2026-05-27** (quarta). Entrega em **2026-06-17** (quarta) — exatamente 1 ano de relacionamento.

## Visão do site

Site one-page, mobile-first, lúdico e divertido. Estrutura em "telas" (não scroll infinito) — cada interação revela a próxima.

### Sequência de telas planejadas

1. **Gate** — "Você é a Luana?" com botão "Não" que foge ✅
2. **Welcome** — nome dela digitando + confetes + música começa ✅
3. **Timeline interativa** — cards com fotos + legendas dos momentos do último ano (com toque ou swipe)
4. **"Coisas que eu amo na Luana"** — lista que aparece no scroll com micro-animações
5. **Easter eggs** — elementos secretos espalhados (toques em locais específicos revelam piadas internas)
6. **Mini-jogo** — algo curto e bobo:
   - Opção A: memory game com fotos de vocês
   - Opção B: pegar corações que caem (estilo arcade)
   - Opção C: quiz "quanto você se conhece" com perguntas do relacionamento
7. **Mensagem final** — desbloqueia ao terminar o jogo, com a frase mais sincera

---

## Cronograma

| Dia | Data       | Etapa                                                                 | Status     |
|-----|------------|-----------------------------------------------------------------------|------------|
| 1   | 27/05 qua  | Setup + design system + tela gate + tela welcome                      | ✅ HOJE    |
| 2   | 28/05 qui  | Polir tela welcome + começar tela 3 (timeline) — estrutura            | ⏳         |
| 3   | 29/05 sex  | Timeline: layout dos cards, navegação por swipe                       | ⏳         |
| 4   | 30/05 sáb  | Timeline: integrar primeiras fotos reais que o Bruno mandar           | ⏳         |
| 5   | 31/05 dom  | Tela 4: "Coisas que eu amo" — layout e animações de scroll            | ⏳         |
| 6   | 01/06 seg  | Easter eggs: planejar onde colocar + implementar primeiros 2-3        | ⏳         |
| 7   | 02/06 ter  | Mini-jogo: definir qual será (A/B/C) e fazer protótipo da mecânica    | ⏳         |
| 8   | 03/06 qua  | Mini-jogo: lógica completa                                            | ⏳         |
| 9   | 04/06 qui  | Mini-jogo: visual + integração com fotos                              | ⏳         |
| 10  | 05/06 sex  | Tela final: mensagem secreta + animação de revelação                  | ⏳         |
| 11  | 06/06 sáb  | Polir transições entre todas as telas                                 | ⏳         |
| 12  | 07/06 dom  | Otimizar fotos (compressão, lazy load, formatos webp)                 | ⏳         |
| 13  | 08/06 seg  | Performance: testar em 4G/3G simulado, lighthouse mobile              | ⏳         |
| 14  | 09/06 ter  | Acessibilidade: aria-labels, navegação por teclado, contraste         | ⏳         |
| 15  | 10/06 qua  | Testes em dispositivos reais — iPhone, Android, tablets               | ⏳         |
| 16  | 11/06 qui  | Bug fixes da rodada de testes                                         | ⏳         |
| 17  | 12/06 sex  | Polimento final de copy, ajustar timing das animações                 | ⏳         |
| 18  | 13/06 sáb  | Buffer: dia livre pra ajustes ou idéias novas que surgirem            | ⏳         |
| 19  | 14/06 dom  | Deploy: Vercel + configurar CNAME do subdomínio luana.bcmtech.com.br  | ⏳         |
| 20  | 15/06 seg  | Gerar QR code estilizado + imprimir + decidir apresentação física     | ⏳         |
| 21  | 16/06 ter  | Última verificação geral + descansar                                  | ⏳         |
| 🎁  | 17/06 qua  | **ENTREGA — 1 ANO** 💛                                                |            |

---

## Riscos e mitigações

| Risco                              | Mitigação                                                          |
|------------------------------------|--------------------------------------------------------------------|
| Bruno não junta fotos a tempo      | Site funciona com placeholders; só plugar fotos no final           |
| Música escolhida tem copyright     | Manter botão de mute desde o início — música é bônus, não core     |
| DNS demora pra propagar            | Configurar no dia 19, sobram 2 dias de folga                       |
| Surge ideia melhor no meio         | Dia 18 é buffer livre — usar pra implementar                       |
| iPhone da Luana tem bug específico | Dia 15 é teste em devices reais com tempo pra ajustar              |

---

## Princípios do projeto

1. **Mobile-first sempre** — ela vai abrir no celular, ponto
2. **Funciona offline depois de carregado** — sem dependências de runtime
3. **Carrega em <3s no 4G** — fotos otimizadas, sem fonts pesadas demais
4. **Tom lúdico, não cafona** — humor > clichê romântico
5. **Sem comportamento irritante** — botão de mute visível, sem som forçado, sem alertas
6. **Reversível** — ela pode voltar pra ver de novo, quantas vezes quiser

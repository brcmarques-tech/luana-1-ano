# Plano — Site Luana 1 ano 💛

> Entrega: **17/06/2026**. Hoje (última sessão): **27/05/2026**. Ainda restam ~21 dias.

---

## ✅ FEITO (em 1 sessão intensa)

### Fluxo principal (8 telas)
- [x] Tela 1 — **Gate**: "Você é a Luana?" com botão "Não" que foge
- [x] Tela 2 — **Welcome**: typing do nome + confetes + áudio
- [x] Tela 3 — **Hanami** 🌸: pausa contemplativa japonesa
- [x] Tela 4 — **Timeline**: 13 cards horizontais com flip 3D estilo livro
- [x] Tela 5 — **Loves**: scroll-reveal de 8 itens
- [x] Tela 6 — **Memory Game**: 6 pares 3×4
- [x] Tela 7 — **TCG Card** 🎴: carta da Luana com tilt 3D (mouse + giroscópio)
- [x] Tela 8 — **Final**: mensagem em cascata + corações flutuando

### Camada ambiental (todas as telas)
- [x] Sakura caindo (denso, SVG inline)
- [x] Lanternas japonesas penduradas no topo balançando
- [x] Pixel pets atravessando borda inferior
- [x] Burst de patinhas no clique (7-9 emojis radial com glow)

### Camada nerd
- [x] HUD RPG persistente top-left (avatar, Lv, barra XP)
- [x] Level Up dourado quando atinge 100% XP
- [x] 8 achievements estilo Xbox (toast no topo-direito)
- [x] Konami code real (↑↑↓↓←→←→BA) com tela tremendo

### Easter eggs (5 escondidos)
- [x] Triplo clique no nome Luana (welcome)
- [x] Clique no contador da timeline (rotaciona stats)
- [x] Triplo clique no coração final (chuva mega)
- [x] Digitar "luana" no teclado
- [x] Konami code

### Transições
- [x] Anime-style entre telas: speed lines + flash + texto-impacto
- [x] Cada tela com seu impact text: `oi!`, `花`, `go!`, `♡♡♡`, `play!`, `ssr!`, `fim?`

### Responsividade
- [x] Mobile-first com max-width 480px
- [x] Desktop com max-width 520-560px + frame decorativo + mais sakura
- [x] prefers-reduced-motion respeitado

### Conteúdo editável (arquivos `js/*-data.js`)
- [x] `timeline-data.js` (13 marcos)
- [x] `loves-data.js` (8 coisas que ama)
- [x] `game-data.js` (6 pares)
- [x] `card-data.js` (atributos da Luana)
- [x] `final-data.js` (mensagem final)

### Git
- [x] Repo inicializado (branch `main`)
- [x] `.gitignore` configurado
- [x] Primeiro commit feito

---

## ⏳ TODO (o que falta)

### Conteúdo (depende do Bruno — sem código)
- [ ] **Fotos** em `assets/img/` (organizar por mês recomendado)
- [ ] **Música** em `assets/audio/musica.mp3` (~128kbps, 2-3MB ideal)
- [ ] **Editar `timeline-data.js`** com momentos reais do ano
- [ ] **Editar `loves-data.js`** com coisas reais que você ama nela
- [ ] **Editar `game-data.js`** trocando emojis por fotos (`photo: 'assets/img/xxx.jpg'`)
- [ ] **Editar `card-data.js`** com atributos personalizados (talvez piadas internas)
- [ ] **Escrever a mensagem final** em `final-data.js` (parágrafos)

### Mini-jogo gatinhos (opcional)
- [ ] Decidir se vale adicionar — site já tem memory game. Pode pular pra não inflar.

### Otimização (pós-conteúdo)
- [ ] Comprimir fotos pra WebP (`cwebp` ou online)
- [ ] Adicionar `loading="lazy"` em imagens fora do viewport inicial
- [ ] Rodar Lighthouse mobile e ajustar pra >90 em performance/accessibility/best-practices
- [ ] Service worker simples pra cache offline (opcional, só se tempo permitir)

### Deploy
- [ ] `npm install -g vercel` + `vercel login` + `vercel --prod`
- [ ] Adicionar domínio `luana.bcmtech.com.br` no painel da Vercel
- [ ] Criar CNAME no DNS do `bcmtech.com.br`: `luana` → `cname.vercel-dns.com.`
- [ ] Esperar propagação + testar HTTPS

### QR Code
- [ ] Gerar com `qrcode` CLI nas cores do projeto (rosa #ff5e8a sobre roxo #1a0a2e)
- [ ] Imprimir + decidir apresentação física (caixa, quadro, postal...)

### Git / GitLab
- [ ] **Bruno criar repo no GitLab** (gitlab.com/projects/new → private)
- [ ] Bruno me passa a URL
- [ ] Eu rodo: `git remote add origin URL && git push -u origin main`

---

## 🎯 Cronograma sugerido (21 dias restantes)

| Dias | Atividade |
|------|-----------|
| 28-29/05 | Bruno reúne fotos + escolhe música |
| 30/05-01/06 | Bruno edita os 5 arquivos `*-data.js` |
| 02-03/06 | Bruno integra fotos reais no game e timeline |
| 04-05/06 | Polimento + testes em devices reais |
| 06-08/06 | Otimização (lazy load, webp, lighthouse) |
| 09-10/06 | Buffer pra ajustes/bug fixes |
| 11/06 | Deploy Vercel + CNAME |
| 12-15/06 | Testes pós-deploy + ajustes finais |
| 16/06 | Gerar QR + imprimir + preparar entrega física |
| **17/06** | **🎁 Entrega — 1 ano** |

---

## 🛠️ Comandos úteis

### Rodar local
```bash
python3 -m http.server 8080
```

### Capturar fluxo visual com Playwright
```bash
npm install
npx playwright install chromium
node scripts/screenshot.mjs
```

### Comprimir música
```bash
ffmpeg -i original.mp3 -b:a 128k assets/audio/musica.mp3
```

### Converter fotos pra WebP
```bash
for f in assets/img/*.jpg; do cwebp -q 80 "$f" -o "${f%.jpg}.webp"; done
```

### Gerar QR estilizado
```bash
npx qrcode "https://luana.bcmtech.com.br" -o qr.png -t png --color.dark "#ff5e8a" --color.light "#1a0a2e"
```

### Deploy Vercel
```bash
npx vercel --prod
```

---

## ⚠️ Pontos de atenção

1. **NÃO abre `index.html` com duplo-clique** — ES modules exigem servidor HTTP, senão o JS quebra silenciosamente
2. **"Reduzir animações" no Windows/Mac** desliga sakura/pets/patinhas (acessibilidade)
3. **Cache do navegador** persiste agressivo — use `Ctrl+Shift+R` ou janela anônima ao testar mudanças
4. **Música só toca após clique** (autoplay bloqueado pelos navegadores)
5. **Áudio em formato MP3** funciona em tudo. M4A/OGG exigem ajuste no `<source>` do `index.html`

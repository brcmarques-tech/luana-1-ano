# Luana — 1 ano 💛

Site-presente pra **Luana Telles Melgarejo** no aniversário de 1 ano do relacionamento.

| | |
|--|--|
| **Data de entrega** | 17/06/2026 |
| **Início do relacionamento** | 17/06/2025 |
| **URL final** | `https://luana.bcmtech.com.br` |
| **Acesso** | QR code impresso/embrulhado |
| **Tom** | divertido, lúdico, temático japonês/nerd |
| **Stack** | HTML + CSS + JavaScript puro (ES modules) |
| **Build step** | nenhum — edita e abre |
| **Responsivo** | mobile-first, ajustes pra desktop |

---

## Como rodar localmente

Não precisa de Node, bundler, nada. Só servir os arquivos estáticos via HTTP (não dá pra abrir o `index.html` com duplo-clique porque ES modules exigem servidor).

### Linux / Mac
```bash
cd luana-1-ano
python3 -m http.server 8080
```

### Windows (PowerShell)
```powershell
cd D:\linux\Documents\luana-1-ano
python -m http.server 8080
```

Abre `http://localhost:8080` no navegador.

### Testando no celular (mesma rede Wi-Fi)
```bash
python3 -m http.server 8080 --bind 0.0.0.0
```
Descobre o IP da máquina (`ip addr` no Linux, `ipconfig` no Windows) e abre `http://SEU_IP:8080` no celular.

### Rodando os scripts de screenshot
```bash
cd luana-1-ano
npm install            # instala playwright
npx playwright install chromium
node scripts/screenshot.mjs       # captura o fluxo completo
node scripts/test-eggs.mjs        # captura easter eggs
node scripts/test-transitions.mjs # captura transições anime
node scripts/test-paws.mjs        # captura burst de patinhas
```
Screenshots salvos em `scripts/screenshots/` (gitignored).

---

## Estrutura do projeto

```
luana-1-ano/
├── index.html                  # estrutura das 8 telas
├── css/
│   └── styles.css              # design system + animações + responsive
├── js/
│   ├── main.js                 # orquestrador principal (ESM)
│   ├── ambient.js              # camada ambiental (sakura, lanternas, pets, patinhas)
│   ├── hud.js                  # HUD RPG persistente
│   ├── achievements.js         # sistema de conquistas
│   ├── easter-eggs.js          # 4 easter eggs + Konami code real
│   ├── transitions.js          # transições anime entre telas
│   ├── timeline-data.js        # 📝 13 cards da timeline (EDITÁVEL)
│   ├── loves-data.js           # 📝 8 coisas que ama nela (EDITÁVEL)
│   ├── game-data.js            # 📝 6 pares do memory game (EDITÁVEL)
│   ├── card-data.js            # 📝 atributos da carta TCG da Luana (EDITÁVEL)
│   └── final-data.js           # 📝 mensagem final (EDITÁVEL)
├── assets/
│   ├── img/                    # 📷 fotos de vocês (você coloca aqui)
│   └── audio/
│       └── musica.mp3          # 🎵 música ambiente (você coloca aqui)
├── scripts/
│   ├── screenshot.mjs          # fluxo completo via Playwright
│   ├── test-eggs.mjs           # captura dos 4 easter eggs
│   ├── test-transitions.mjs    # captura das transições anime
│   ├── test-paws.mjs           # captura do burst de patinhas
│   └── screenshots/            # output (gitignored)
├── README.md                   # este arquivo
├── PLANO.md                    # roadmap detalhado
└── CONTINUAR_NO_LINUX.md       # guia rápido pra continuar de outra máquina
```

---

## Fluxo do site (8 telas)

1. **Gate** — "Você é a Luana?" com botão "Não" que foge no hover/toque
2. **Welcome** — typing do nome "Luana" + confetes + música começa
3. **Hanami** 🌸 — pausa contemplativa japonesa (花見) com quote poético
4. **Timeline** — 13 cards horizontais (jun/25 → jun/26) com efeito flip 3D estilo livro
5. **Loves** — lista vertical com scroll-reveal de 8 coisas que ama nela
6. **Memory Game** — 6 pares (12 cartas) estilo Pokémon, completa pra desbloquear
7. **TCG Card** 🎴 — carta estilo gacha da Luana com stats, habilidades e tilt 3D (mouse/giroscópio)
8. **Final** — mensagem em cascata + corações flutuando + assinatura

---

## Features ambientais (rodam em todas as telas)

- **Sakura caindo** 🌸 — pétalas SVG caem continuamente no fundo (mais densas em desktop)
- **Lanternas japonesas** 🏮 — 3 lanternas vermelhas penduradas no topo balançando
- **Pixel pets** 🐱🐶 — gatos/cachorros emoji atravessam ocasionalmente a borda inferior
- **Burst de patinhas no click** 🐾 — 7-9 patinhas se espalham radialmente do ponto clicado
- **HUD RPG persistente** — `🌸 Lv.X ▓░░░` no canto, barra XP enche de 0→100 conforme avança nas telas, Level Up dourado ao completar

---

## Achievements (8 conquistas)

Aparecem como toast estilo Xbox (canto superior direito) quando desbloqueadas:

| ID | Trigger |
|----|---------|
| 👣 Primeiro passo | Clicar "Sim" na gate |
| 📅 Memória do ano | Ver todos os 13 cards da timeline |
| 💌 Coleção do amor | Ler todas as 8 coisas que ama |
| 🧠 Memorizadora pro | Completar o memory game |
| ✨ Final feliz | Chegar até a tela final |
| 🥚 Caçadora de segredos | Achar 1 easter egg |
| 🏆 Lendária | Achar os 4 easter eggs |
| 🎮 Hardcore gamer | Executar o Konami code (↑↑↓↓←→←→BA) |

---

## Easter eggs (5 escondidos)

1. **Welcome name** — triplo clique no nome "Luana" → confetes + toast
2. **Timeline counter** — clique no "1/13" → rotaciona stats inventadas ("8.760 horas com você", "525.600 minutos juntos", "1.245 cafés tomados", "0 vezes que cansei", "∞ vontades de te abraçar")
3. **Final heart** — triplo clique no coração da tela final → chuva mega de corações
4. **Digite "luana"** — em qualquer tela com teclado → mensagem grande "você digitou meu nome favorito 💛"
5. **Konami code** — ↑↑↓↓←→←→BA no teclado → "🎮 KONAMI CODE 🎮" + tela treme com invert

Contador "🥚 X/4" aparece no top-center quando acha o primeiro (não rastreia Konami).

---

## O que você precisa fazer (pra finalizar)

### Conteúdo (edita os arquivos `.js`)

1. **Fotos** — joga em `assets/img/`. Pode em subpastas por mês. Formato `.jpg`/`.png`/`.webp`.
2. **Música** — salva em `assets/audio/musica.mp3`. Recomendo comprimir pra ~128kbps:
   ```bash
   ffmpeg -i original.mp3 -b:a 128k musica.mp3
   ```
3. **Timeline** — edita `js/timeline-data.js`, 13 marcos do ano (data + caption + foto opcional)
4. **Coisas que ama** — edita `js/loves-data.js`, 8 itens (emoji + texto + sub)
5. **Memory game** — edita `js/game-data.js`, 6 pares (emoji ou foto + label)
6. **Carta TCG** — edita `js/card-data.js` (nome, stats, habilidades, flavor)
7. **Mensagem final** — edita `js/final-data.js` (parágrafos da carta)

### Deploy (quando conteúdo estiver pronto)

```bash
npm install -g vercel
vercel login
vercel --prod
```

No painel da Vercel:
- Project → Settings → Domains → adicionar `luana.bcmtech.com.br`

No DNS do `bcmtech.com.br` (Registro.br ou outro):
- Criar registro **CNAME**: `luana` → `cname.vercel-dns.com.`

Espera 5-30 min pra propagação, testa HTTPS.

### QR code

```bash
npx qrcode "https://luana.bcmtech.com.br" -o qr.png -t png --color.dark "#ff5e8a" --color.light "#1a0a2e"
```

Ou usa https://qrcode-monkey.com pra QR com logo/coração no meio.

---

## Decisões técnicas

- **Sem framework** — mais leve, carrega instantâneo no 4G, sem build step
- **ES modules** — código modular, importa direto no browser. **Exige servidor HTTP**, não funciona via `file://`
- **Mobile-first** com `max-width: 480px` (mobile) / `520px` (tablet) / `560px` (desktop) — experiência consistente
- **`100dvh`** em vez de `100vh` — evita bug da barra do Safari mobile
- **`prefers-reduced-motion`** — respeitado em sakura, pets, transições anime (desabilita)
- **Autoplay de áudio** — só dispara após clique do usuário (navegadores bloqueiam autoplay)
- **Backdrop blur** com fallback gracioso — funciona em Safari/Chrome/Firefox modernos
- **SVG inline em data URIs** — sakura e lanternas sem requisição extra

# Luana — 1 ano 💛

Site-presente pra Luana Telles Melgarejo no aniversário de 1 ano do relacionamento.

- **Data de entrega:** 17/06/2026
- **Início do relacionamento:** 17/06/2025
- **URL final:** `https://luana.bcmtech.com.br`
- **Acesso:** QR code impresso/embrulhado
- **Tom:** divertido e lúdico (piadas internas, easter eggs, mini-jogos) — NÃO romântico clássico
- **Stack:** HTML + CSS + JavaScript puro, mobile-first, zero build step

---

## Como rodar localmente

Não precisa de Node, bundler, nada. É só servir os arquivos estáticos.

### Opção 1 — Python (Linux / Windows / Mac)

```bash
cd luana-1-ano
python3 -m http.server 8080
# abre http://localhost:8080
```

### Opção 2 — Node (se preferir)

```bash
npx serve .
```

### Opção 3 — VS Code

Extensão **Live Server** → clicar com botão direito em `index.html` → "Open with Live Server".

### Testando no celular (mesma rede Wi-Fi)

1. Descubra o IP da sua máquina:
   - Linux/Mac: `ip addr` ou `ifconfig`
   - Windows: `ipconfig`
2. No servidor acima, troque pra escutar em todas as interfaces:
   ```bash
   python3 -m http.server 8080 --bind 0.0.0.0
   ```
3. No celular, abra `http://SEU_IP:8080` (ex: `http://192.168.0.10:8080`)

---

## Estrutura do projeto

```
luana-1-ano/
├── index.html          # estrutura das telas
├── css/
│   └── styles.css      # design system + animações
├── js/
│   └── main.js         # lógica das telas, typing, confetes, áudio
├── assets/
│   ├── img/            # fotos de vocês (você coloca aqui)
│   └── audio/
│       └── musica.mp3  # música ambiente (você coloca aqui)
├── README.md           # este arquivo
└── PLANO.md            # roadmap dos 21 dias
```

---

## Status atual (dia 1 de 21)

✅ Concluído:
- Setup do projeto + design system (paleta lúdica: roxo escuro + rosa + amarelo + verde menta)
- Tela 1: **gate** com brincadeira "Você é a Luana?" — botão "Não" foge no hover/toque, com mensagens crescentes
- Tela 2: **welcome** com efeito typing do nome dela + confetes + áudio
- Sistema de navegação entre telas
- Botão de mute/unmute persistente
- Mobile-first com viewport bloqueado, safe area do iOS, prefers-reduced-motion

⏭️ Próximas etapas: ver `PLANO.md`

---

## Onde colocar os assets

### Fotos
Solta tudo em `assets/img/` — qualquer formato (`.jpg`, `.png`, `.webp`, `.heic`).
A gente nomeia depois conforme o uso (ex: `01-primeiro-encontro.jpg`, `02-viagem-praia.jpg`).

**Dica:** se forem muitas, organizar em subpastas por data ajuda:
```
assets/img/
├── 2025-06-junho/
├── 2025-07-julho/
└── ...
```

### Música
Coloca o arquivo em `assets/audio/musica.mp3`.
Se for outro formato (`.m4a`, `.ogg`), me avisa que eu ajusto o `<source>` no HTML.

**Recomendado:** comprimir pra ~128kbps pra não pesar no celular (uns 2-3MB no máximo).
- Online: https://www.freeconvert.com/audio-compressor
- Linux: `ffmpeg -i original.mp3 -b:a 128k musica.mp3`

---

## Deploy (quando chegar a hora — etapa do dia 19)

### Configuração do subdomínio `luana.bcmtech.com.br`

1. **Hospedagem recomendada: Vercel** (grátis, suporta domínio custom)
2. Subir o projeto:
   ```bash
   cd luana-1-ano
   npx vercel --prod
   ```
3. No painel da Vercel:
   - Project → Settings → Domains → adicionar `luana.bcmtech.com.br`
4. No painel onde está o DNS do `bcmtech.com.br` (Registro.br ou outro):
   - Criar registro **CNAME**: `luana` → `cname.vercel-dns.com.`
5. Esperar propagação (5-30 min) e testar HTTPS.

### Alternativa: Netlify
Mesma coisa, com `npx netlify deploy --prod` e CNAME `luana` → `apex-loadbalancer.netlify.com`.

---

## QR Code final (dia 20)

Gerar com `qrcode` (npm) estilizado em rosa/roxo:
```bash
npx qrcode "https://luana.bcmtech.com.br" -o qr.png -t png --color.dark "#ff5e8a" --color.light "#1a0a2e"
```
Ou usar https://qrcode-monkey.com pra QR com logo/coração no meio.

---

## Decisões técnicas

- **Sem framework:** mais leve, carrega instantâneo no 4G, fácil de hospedar em qualquer lugar
- **Sem build step:** edita e abre — funciona igual no Linux, Windows, Mac
- **Mobile-first com `max-width: 480px`:** garante experiência consistente; abrir no desktop também funciona, fica centralizado
- **`100dvh` em vez de `100vh`:** evita o bug da barra do Safari/Chrome mobile
- **Autoplay de áudio só após clique:** navegadores bloqueiam autoplay sem interação — por isso a música só começa quando ela clica "Sim 💛"
- **`prefers-reduced-motion`:** respeita se o sistema dela tiver animações reduzidas

---

## Tarefas pendentes do Bruno

- [ ] Juntar fotos em `assets/img/`
- [ ] Escolher e colocar música em `assets/audio/musica.mp3`
- [ ] Listar momentos marcantes do último ano (viagens, primeiras vezes, datas)
- [ ] Listar piadas internas / referências que só vocês entendem
- [ ] Listar 3-10 coisas que você ama nela
- [ ] Escrever a mensagem final secreta (aparece no fim do mini-jogo)
- [ ] Configurar DNS do subdomínio (dia 19)

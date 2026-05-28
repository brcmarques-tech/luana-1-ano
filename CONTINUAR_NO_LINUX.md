# 🐧 Continuar no Linux

Guia rápido pra você abrir o projeto numa máquina Linux amanhã e continuar de onde paramos.

---

## 1. Onde estão os arquivos

O projeto **inteiro** está em `D:\linux\Documents\luana-1-ano\` no Windows. No Linux, mesma pasta provavelmente vira algo tipo `/mnt/d/linux/Documents/luana-1-ano/` (WSL) ou `~/Documents/luana-1-ano/` (cópia local).

**Recomendado:** já que está num disco compartilhado (`D:/linux/Documents/`), abre direto a pasta no Linux e segue. Sem precisar copiar nada.

---

## 2. Conferir que tudo está commitado

```bash
cd /caminho/pra/luana-1-ano
git status
```

Deve mostrar **"nothing to commit, working tree clean"** ou as últimas mudanças que vamos commitar agora.

Se ainda não foi pra um remote (GitLab), você pode optar por:
- Criar o repo no GitLab agora → me passar a URL → eu faço o push
- Ou trabalhar local-only por enquanto

---

## 3. Rodar o site (passo a passo)

```bash
cd /caminho/pra/luana-1-ano
python3 -m http.server 8080
```

Abre `http://localhost:8080` no navegador. **NÃO abra `index.html` com duplo-clique** — os módulos ES não carregam via `file://`.

Se der erro de porta ocupada:
```bash
python3 -m http.server 8081
```

---

## 4. Editar conteúdo (sem mexer em código)

Toda a parte editável está em **5 arquivos `js/*-data.js`**:

| Arquivo | O que tem |
|---------|-----------|
| `js/timeline-data.js` | 13 marcos do ano (data + caption + foto opcional) |
| `js/loves-data.js` | 8 coisas que você ama nela |
| `js/game-data.js` | 6 pares do memory game (emoji ou foto) |
| `js/card-data.js` | Atributos, habilidades e flavor da carta TCG da Luana |
| `js/final-data.js` | Mensagem final em parágrafos |

Abre cada um, edita as strings em português, salva. Recarrega o navegador (Ctrl+F5) pra ver.

**Pra trocar emoji por foto** no memory game ou timeline, basta substituir:
```js
{ id: 'p1', emoji: '🌅', label: 'manhãs' }
```
por:
```js
{ id: 'p1', photo: 'assets/img/foto-do-amanhecer.jpg', label: 'manhãs' }
```

---

## 5. Adicionar fotos e música

```bash
cp ~/Downloads/foto1.jpg assets/img/
cp ~/Downloads/foto2.jpg assets/img/
# etc
cp ~/musicas/nossa-musica.mp3 assets/audio/musica.mp3
```

Pra organizar por mês (opcional):
```
assets/img/
├── 2025-06-junho/
├── 2025-07-julho/
└── ...
```

**Comprimir música pra ~128kbps:**
```bash
ffmpeg -i original.mp3 -b:a 128k assets/audio/musica.mp3
```

---

## 6. Rodar os scripts de teste (Playwright)

Só faz isso se quiser capturar screenshots automáticos do fluxo:

```bash
npm install
npx playwright install chromium

# rodar com servidor já no ar em outro terminal
node scripts/screenshot.mjs           # fluxo completo
node scripts/test-eggs.mjs            # easter eggs
node scripts/test-transitions.mjs     # transições anime
node scripts/test-paws.mjs            # burst de patinhas
```

Screenshots salvos em `scripts/screenshots/` (gitignored).

---

## 7. Próximos grandes passos (em ordem)

1. **Editar os 5 arquivos `*-data.js`** com seu conteúdo real
2. **Adicionar fotos** em `assets/img/` e música em `assets/audio/musica.mp3`
3. **Atualizar `game-data.js`, `timeline-data.js`** trocando emojis por fotos
4. **Testar de ponta a ponta** no celular (mesma rede Wi-Fi: `python3 -m http.server 8080 --bind 0.0.0.0` e acessa `http://SEU-IP:8080`)
5. **Deploy Vercel** quando estiver satisfeito
6. **Configurar CNAME** `luana.bcmtech.com.br` → `cname.vercel-dns.com.`
7. **Gerar QR code** + imprimir + preparar entrega física

Detalhado em `PLANO.md`.

---

## 8. Estado atual do projeto

**Tá tudo pronto tecnicamente.** O site funciona end-to-end com placeholders. Falta:

- Conteúdo real (fotos, música, textos personalizados)
- Mini-jogo gatinhos (opcional, sugiro pular)
- Deploy + QR code

Resumo completo de features em `README.md`.
Lista detalhada do que falta em `PLANO.md`.

---

## 9. Se algo quebrar

1. Verifica console do navegador (F12 → Console). Erros vermelhos são pista óbvia.
2. Confirma que tá rodando via `http://localhost:8080` e não `file://`
3. Force refresh: `Ctrl+Shift+R`
4. Se tudo falhar, `git status` pra ver se tem mudanças não-commitadas que confundiram

Histórico completo no `git log --oneline`.

---

## 10. Sessão anterior — onde paramos

- Última coisa que fizemos: ajustamos as patinhas no clique pra ficarem maiores e mais brilhantes (1.5-2.1rem, glow rosa intenso)
- Cursor voltou ao padrão do navegador (não mais formato de coração)
- Sakura tá densa (14-22 pétalas iniciais já em posições visíveis)
- Funcionou em todos os testes Playwright
- Bruno reportou que não estava vendo as patinhas → suspeita de cache do navegador OU "Reduzir animações" do Windows ativado

**Primeira coisa a fazer no Linux:** abrir o site, clicar em algum lugar vazio, ver se as patinhas aparecem. Se sim, problema era do Windows. Se não, debugar a partir daí.

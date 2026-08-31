# Grimório de Thanato — AGENTS.md

## Stack
- Alpine.js 3 (SPA com componentes)
- Vite (build tool)
- localStorage (via `localDB.js`)
- Sem frameworks CSS externos

## Estrutura
```
index.html          → markup principal (SPA inline, sem router lib)
src/
  main.js           → Alpine setup, stores, rotas, componentes
  style.css         → estilos globais
  lib/localDB.js    → persistência localStorage
  data/             → reexporta os JSONs de dados (armas, equipamentos, habilidades)
  components/
    character/      → ficha de personagem (inclui aba Dados com rolador)
    dice/           → rolador de dados (componente aninhado na ficha)
    campaign/       → campanhas
    master/         → painel do mestre
    reference/      → consulta de referências
```

## Arquivos de Dados (raiz do front, JSON)

- `armas-tormenta20.json` → `src/data/armas.js`
- `equipamentos-tormenta20.json` → `src/data/equipamentos.js`
- `habilidades-classes-tormenta20.json` + `habilidades-gerais-tormenta20.json` → `src/data/habilidades.js` (mescla os dois)
- `condicoes-tormenta20.json` (importado em `src/components/reference/reference.js`)

## Rotas (History API)
| Pagina      | URL             |
|-------------|-----------------|
| Inicio      | `/`             |
| Personagens | `/personagens`  |
| Campanhas   | `/campanhas`    |
| Mestre      | `/mestre`       |
| Referencia  | `/referencia`   |

Implementadas em `Alpine.data("router", ...)` em `main.js`. Navegacao por `navigate(page)`, olhando `currentPage` no escopo do componente.

## Temas e Cores
- Paleta: azul marinho (`--primary: #2b6cb0`, `--primary-hover: #4299e1`)
- Background: `--bg: #0a0e1a`
- Fonte principal: `"Erudite", serif` (usar em h1, h2, nav-brand, nav-links, hero-title, info-title, info-card h3, cta-section h2, condition-card h3, hero-btn)
- `letter-spacing: 2px` em todos os elementos com fonte Erudite

## Landing Page
- Fora do `<main class="main-content">` (full-width)
- Hero section com banner (`/banner.jpg`), overlay, titulo, subtitulo, botao "Comecar"
- Gradiente de fundo: `linear-gradient(60deg, #0a0e1a, #1a365d, #2b6cb0)` (estatico, sem animacao)
- 3 cards informativos abaixo do hero, dentro de `.landing-inner` (max-width 960px)
- CTA final

## Navbar
- Sempre visivel (removido `x-show`)
- "Grimorio de Thanato" clicavel → `navigate('home')`
- Em mobile: `flex-direction: column; align-items: center`

## Botoes (.hero-btn)
- Fundo branco, texto azul, sem borda
- Hover: fundo azul desliza (`::before translateX`), texto fica branco, sobe `-6px -3px`, sombra preta `5px 10px`
- Active: afunda `2px 1px`, sombra zera
- Fonte Erudite, letter-spacing 2px

## Formulario de Personagem
- Campos de selecao (dropdown) para: Raca, Classe, Origem, Divindade
- Opcoes definidas em `character.js` (RACAS, CLASSES, ORIGENS, DIVINDADES)
- RACAS: apenas livro basico (Anao, Dahllan, Elfo, Gnomo, Golem, Halfling, Humano, Lefeu, Minotauro, Qareen, Tritao)
- CLASSES: 15 classes do T20 Jogo do Ano
- ORIGENS: todas as origens do livro basico
- DIVINDADES: 20 divindades de Arton

## Abas da Ficha (coluna direita)
- 6 abas: Pericias, Inventario, Magias, Habilidades, Descricao, Dados
- Indicador animado com `translateX` baseado no indice da aba ativa
- Largura do indicador: `calc(100% / 6)`
- Aba "Dados" contem o rolador de dados (rolador manual, resultado e historico)
- Abas de Magias e Descricao ainda sao placeholders "Em breve"
- Aba "Habilidades": abas Classe e Geral, lista "carregadas" na ficha + popup "Adicionar Habilidade" com busca
- Componente `dice` (`x-data="dice"`) fica no wrapper da pagina de personagens (sempre montado), assim o D20 popup e os mini-toasts de resultado aparecem independente da aba ativa

## D20 Popup (Rolagem de D20)
- Overlay com animacao de giro do D20, resultado numerico e label de critico/falha
- Fases: `spin` (animacao), `result` (exibe numero), `fadeout` (some)
- Container `.d20-img-container` com `position: relative` para posicionar numero sobre a imagem
- Placeholder `d20-num-placeholder` exibe "D20" enquanto gira, some no resultado
- Resultado `d20-num-result` aparece com `numFadeIn` em `phase-result`
- Critico (20): verde (`#4ade80`), Falha (1): vermelho (`#ef4444`)
- Popup renderizado no wrapper global do `dice`, aparece na pagina de personagens independente da aba ativa

## Mini-toasts de rolada (dados normais)
- Todos os dados (incluindo criticos) disparam `pushMiniToast(label, result, detail, diceDetails)` no componente `dice`
- Container `.dice-mini-toasts` fixo no canto inferior direito da tela (`bottom/right 1rem`), z-index 1100
- Toast `.dice-mini-toast` exibe label, resultado e detalhe; auto-dismiss em 4s; clique dispensa antes
- Aparece na pagina de personagens independente da aba ativa

## Toasts (Pop-ups)
- Store global `toasts` em `main.js`: `push(message, type)` com tipos `success`, `error`, `info`
- Container fixo no topo central da tela (`index.html`), sobe com animacao `toast-rise`
- Auto-dismiss em 3,4s; clique no toast dispensa antes
- Disparar via `this.$store.toasts.push("msg", "type")` nos componentes

## Efeitos Sonoros (toggle de microfone)
- Store global `sound` em `main.js` (store com getter `enabled` reativo): `toggle()` inverte e persiste em `localStorage` sob `grimorio_sound` (`"on"`/`"off"`)
- Botao de microfone no dropdown de configuracoes (navbar) alterna o store; icone `mic`/`mic_off` + rotulo "Desativar sons"/"Ativar sons"
- Todos os 5 efeitos sonoros em `dice.js` (`playDiceSound`, `playSuccessSound`, `playFailSound`, `playAcertoCriticoSound`, `playFalhaCriticaSound`) checam `$store.sound.enabled` antes de tocar

## Ataque (arma) — rolagem e critico
- `rolarAtaque(arma)` em `character.js` dispara `roll-ataque` (evento window) com `mod`, `danoMod` (= modificador do atributo da arma) e pericia
- Handler em `dice.js`: rola `1D20+mod` e depois o dano `arma.dadoDeDano + danoMod` (o modificador de atributo soma no dano)
- Critico (20 natural no d20) multiplica a **quantidade de dados**: usa `multiplyDiceFormula(arma.dadoDeDano, multiplicador)` (ex.: `1d8` x3 → `3d8`), somando o modificador uma unica vez. Nao multiplica o valor do resultado
- Toast de ataque: hover pausa o dismiss, botao ✕ dispensa, critico dura 10s e fica verde; historico tem linha `.sub` de dano

## Inventario — adicionar/editar/excluir
- Popup "Criar/Editar Equipamento" via `openCriarPopup('equipamento')` com seletor de tipo (`criarTipoSelector` / `setCriarEquipTipo`): Arma, Protecao, Equipamento
- Itens carregados (armas/protecoes/equipamentos) tem expansao de descricao com botoes Editar/Deletar (`.t20-btn-edit` com hover de lift/sombra; `.t20-btn-del`)
- `criarItem` em `character.js` ramifica por `criarTipo` (`arma`, `protecao`, `item`, `magia`, `habilidade`); em modo edicao chama `updateArma`/`updateProtecao`/`updateEquipamento`
- Form de arma inclui campos Atributo (`ATRIBUTOS_LIST`) e Pericia (`PERICIAS_LIST`); `editarArma` preenche da arma; salva `atributo`/`pericia` no create/update
- `closeCriarPopup`/`openCriarPopup` resetam os modos de edicao (`editArmaMode`, `editProtecaoMode`, `editEquipamentoMode`)

## Caixa de Defesa (ficha)
- `calcDefesa()` soma `equippedArmaduraBonus()` + `equippedEscudoBonus()` (split por `tipoProtecao === "Escudo"`) + modificadores; formula auto calculada (read-only, `.t20-def-auto`)
- Tabela de defesa lista apenas protecoes equipadas (`.t20-equipped-prot-*`); `calcPenalidadeArmadura()` soma penalidades das protecoes equipadas

## Ataques (aba "ATAQUES")
- Coluna CRITICO mostra `critico/multiplicador` da arma; ataque mod calculado por `armaAtaqueMod` (metade do nivel + treino + outros − penalidade de armadura + atributo)

## Build
```sh
npm run build   # saida em dist/
npm run dev     # servidor de desenvolvimento
```

## Referencia (Condições)
- Pagina "Referencia" renderizada em `index.html` com `x-data="reference"`
- Dados vindos de `condicoes-tormenta20.json` (importado em `src/components/reference/reference.js`)
- Cada condição: `{ nome, tipo, descricao }` (nome formatado das chaves, tipo = categoria, descricao = efeitos_e_penalidades)

## Armas (Inventario)
- Dados das armas vêm de `armas-tormenta20.json` (importado em `src/data/armas.js`, que reexporta o JSON)
- Cada arma: `{ nome, preco, dadoDeDano, alcance, peso, tipoDano, tipoArma, critico, multiplicador, descricao }`
- Armas do personagem tambem carregam `atributo` e `pericia` (definidos no form de arma), usados em `armaPericiaInfo`/`armaAtaqueMod`/`rolarAtaque`

## Habilidades (aba HABILIDADES)
- Dados combinados em `src/data/habilidades.js` (mescla habilidades de classe + habilidades gerais); ambos os JSONs tem formato `{ nome, descricao, gastoPe, classe }`
- Abas Classe e Geral (estado em `activeHabilidadeTab`); categoria das habilidades gerais e `classe: "Geral"`
- `habClasses` lista classes unicas ignorando "Geral"; `habilidadesFiltradas` filtra por tab + `habilidadesSearchTerm`
- Popup "Adicionar Habilidade" e ficha (lista `habilidadesCarregadas`) usam `habilidadesCarregadasFiltradas` para separar Classe/Geral
- `addHabilidadeToFicha(hab)` cria via `createHabilidade` (salva `nome`, `descricao`, `classe`, `gastoPe`); `removeHabilidadeFicha(id)` via `deleteHabilidade`; `loadHabilidadesFicha` recarrega a lista
- ABRIGO: lista de classe em `habilidades-classes-tormenta20.json` (136) e gerais em `habilidades-gerais-tormenta20.json` (151)
- Ataque de habilidade nao depende de backend de arma; habilidades ficam apenas na ficha

## Convencoes
- Nao adicionar comentarios em CSS/JS
- IDs gerados com `generateId()` de `localDB.js`
- Usuario logado no store `auth`, restaurado da sessao em localStorage (`grimorio_session` via `localDB`); fallback convidado (`DEV_USER_ID`) quando nao ha sessao

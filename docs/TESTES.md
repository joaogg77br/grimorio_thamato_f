# Suite de testes

A suite usa Vitest para verificar as regras do componente de personagem. Ela
importa `src/components/character/character.js` e executa os metodos reais,
incluindo getters e dados do wizard. Nao extrai trechos do arquivo nem copia as
regras para dentro dos testes.

## Preparacao

Use Node 22 (22.12 ou superior dentro dessa versao), Node 24 ou Node 26+,
conforme os requisitos do Vitest 5. A suite foi validada com Node 22.12.0.
Em uma instalacao nova, execute:

```sh
npm ci
```

Nao e necessario iniciar o servidor, configurar `.env`, entrar em uma conta ou
ter o backend disponivel. A instalacao de dependencias requer acesso ao npm;
a execucao dos testes nao precisa de rede.

## Comandos

```sh
npm test
```

Executa toda a suite uma vez e termina. Retorna codigo zero quando todos os
testes passam e codigo diferente de zero quando algum falha.

```sh
npm run test:watch
```

Mantem o Vitest aberto e reexecuta os testes afetados quando os arquivos mudam.
Encerre com Ctrl+C.

```sh
npm test -- tests/character-save.test.js
npm test -- -t "preserva a ficha"
npm test -- --reporter=verbose
```

Os comandos acima executam um arquivo, filtram pelo nome do caso e mostram
resultados detalhados, respectivamente.

```sh
npm run check
```

Executa a suite e, se passar, gera o build de producao. Use antes de entregar uma
alteracao. Esse comando encerra sozinho e tambem pode ser usado em CI.

## Cenarios cobertos

| Arquivo | Comportamentos |
| --- | --- |
| `tests/character-wizard.test.js` | Valores iniciais, custo progressivo, devolucao de pontos, limites 8 a 18, entradas invalidas, bonus raciais, restricoes de etapas, nome e classe obrigatorios. |
| `tests/character-save.test.js` | Debounce de 1,5 segundo, estados que suspendem autosave, serializacao de requisicoes, edicao durante salvamento, saida com dados pendentes, clique duplicado, falhas e nova tentativa. |
| `tests/character-sections.test.js` | Abertura das sete secoes, fechamento de popups e menu, limpeza do modo de edicao de arma e preservacao dos dados ao fechar uma secao. |

## Isolamento

- Cada caso cria seu proprio estado usando `character.data()`.
- `vi.mock("../src/useApi/index.js")` substitui as funcoes da API. Nenhum teste
  envia requisicoes reais ou modifica personagens no banco.
- O helper `tests/helpers/character.js` fornece usuario ficticio, captura de
  toasts e uma versao simplificada de `$nextTick`.
- Nos testes de salvamento, `save()` e o fluxo de autosave sao reais. A API,
  a recarga da lista e a atualizacao das pericias sao simuladas. Um caso faz
  essa ultima operacao falhar para verificar que a ficha permanece aberta.
- Relogios simulados (`vi.useFakeTimers`) avancam os 1,5 segundos sem espera
  real. Ao terminar cada caso, os timers sao descartados e o relogio restaurado.
- O helper `deferred()` permite manter uma requisicao pendente ate o teste
  liberar sua resposta. Isso verifica o estado antes e depois do salvamento.

## Adicionar um caso

Crie um arquivo `tests/nome-do-fluxo.test.js` ou acrescente um `it` ao grupo
correspondente. O arquivo `vitest.config.js` reconhece `tests/**/*.test.js`.

Exemplo com estado novo e API isolada:

```js
import { expect, it, vi } from "vitest"
import { createCharacter } from "./helpers/character.js"

vi.mock("../src/useApi/index.js")

it("devolve pontos ao reduzir um atributo", () => {
  const state = createCharacter()
  state.wizardAtribuir("FOR", 15)

  state.wizardDec("FOR")

  expect(state.wizardAtributos.FOR).toBe(14)
  expect(state.wizardPontosRestantes).toBe(16)
})
```

Prefira verificar resultados observaveis: dados preservados, etapa liberada,
orcamento e payload enviado. Nao substitua por mock o metodo cujo comportamento
voce quer testar. Para corrigir um bug, adicione primeiro um caso que o reproduza
e confirme que ele falha antes da correcao.

## Interpretar falhas

O Vitest mostra o arquivo, o nome do caso, o valor esperado e o valor recebido.
Execute apenas o arquivo afetado enquanto investiga. Se uma regra do produto
mudou intencionalmente, ajuste a expectativa para essa regra; nao remova a
verificacao apenas para deixar o resultado verde.

## Limites atuais

Esta e uma suite de logica de componente, executada em Node. Ela nao monta o
Alpine no navegador, nao dispara eventos de toque e nao verifica CSS, foco,
atributos `inert`, rolagem, teclado virtual ou sobreposicao de elementos.

O teste de debounce chama `scheduleAutoSave()` diretamente: ele valida o tempo
e o salvamento, mas nao o registro do watcher do Alpine. Os testes da API
simulada nao validam autenticacao, contratos HTTP, persistencia real ou a
implementacao das requisicoes de pericias.

Tambem nao ha, nesta primeira suite, cobertura de campanhas, painel do mestre,
rolagens de dados e login. Nao foi configurado relatorio percentual de cobertura.

Para alteracoes visuais, confira no navegador desktop e celular: criar um
personagem, distribuir pontos, trocar secoes, abrir e fechar popups e sair da
ficha depois de editar. Testes de navegador podem ser adicionados depois para
automatizar esses fluxos. Build aprovado nao substitui essa verificacao visual.

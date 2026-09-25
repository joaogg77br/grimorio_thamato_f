# Grimorio de Thanato

Frontend de apoio a mesas de Tormenta 20, construido com Alpine.js e Vite.

## Desenvolvimento

Para executar tambem a suite de testes, use Node 22.12+ da linha 22, Node 24 ou
Node 26+.

```sh
npm ci
npm run dev
```

## Validacao

```sh
npm test
npm run check
```

`npm test` executa a suite automatizada. `npm run check` executa os testes e o
build de producao.

A [documentacao da suite](docs/TESTES.md) explica os cenarios cobertos, os
comandos, o isolamento da API, como adicionar casos e os limites atuais.

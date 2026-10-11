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

Para verificar as rotas no Chromium, em desktop e mobile:

```sh
npx playwright install chromium
npm run test:e2e
```

Os testes de navegador simulam a API e nao alteram personagens reais.

## Navegacao

A navegacao usa [alpinejs-router](https://github.com/shaunlee/alpinejs-router)
em modo HTML5. Links usam `x-link`, acoes usam `$router.push()` e
redirecionamentos usam `$router.replace()`. A visibilidade das telas depende
de `$router.is()`, sem um estado `currentPage` separado.

As fichas usam `/personagens/ficha/:secao?id=:personagem`, permitindo voltar,
avancar e recarregar a ficha. Links antigos sem ID retornam a lista quando
nao existe ficha aberta. As campanhas usam `/campanhas/minhas` e
`/campanhas/entrar`; `/campanhas` continua abrindo a lista.

O servidor deve servir `index.html` para as rotas da SPA. O Vite e o
`vercel.json` ja oferecem esse fallback.

A [documentacao da suite](docs/TESTES.md) explica os cenarios cobertos, os
comandos, o isolamento da API, como adicionar casos e os limites atuais.

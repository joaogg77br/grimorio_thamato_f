# Revisão dos dados de Tormenta20

A referência desta revisão é o PDF fornecido no projeto, uma prévia para apoiadores datada de **28 de maio de 2020**, com 295 páginas. O próprio arquivo avisa que ainda não contém os capítulos finais e inclui páginas do playtest como material provisório. **Não é a edição Jogo do Ano.** Os valores foram conferidos contra esse arquivo, sem aplicar silenciosamente regras de outras edições.

Os registros revisados recebem `fonte.edicao`, `fonte.pagina` (numeração impressa) e `fonte.paginaPdf` (posição no arquivo, começando em 1). As condições usam a numeração própria do playtest anexado. O inventário completo e as pendências estão em [auditoria-dados-tormenta20.json](../auditoria-dados-tormenta20.json).

## Cobertura

| Catálogo | Antes | Depois | Trabalho realizado |
| --- | ---: | ---: | --- |
| Armas e munições | 37 | 47 | Tabelas de dano, preço, peso, crítico, categoria e alcance; descrições, recarga, empunhadura e propriedades |
| Proteções | 12 | 12 | Valores da tabela, descrições, penalidades e limitações de armaduras pesadas |
| Equipamentos | 50 | 52 | Preços ausentes, descrições, efeitos alquímicos e de alimentação; pônei de guerra e água benta |
| Habilidades de classe | 136 | 384 | 383 registros localizados no PDF, incluindo opções de caminho, linhagens e formas; 1 registro anterior preservado sem confirmação |
| Poderes gerais | 151 | 151 | 135 localizados e revisados; 16 anteriores preservados sem confirmação |
| Poderes de origem | 35 | 35 | Correção das regras, efeitos e custos |
| Habilidades raciais | 54 | 56 | Inclusão de Espírito Elemental e Sem Origem do golem; sincronização com os registros de raça |
| Raças | 18 | 18 | Descrições e habilidades completas; bônus fixos separados das três escolhas de atributos |
| Divindades | 20 | 20 | Devotos permitidos, arma preferida, energia, obrigações e poderes relacionados |
| Magias | 110 | 198 | Círculo, escola, custo, execução, alcance, alvo/área/efeito, duração, resistência, truques e aprimoramentos |
| Classes e evolução | 14 | 14 | Progressão dos 20 níveis, características e escolhas alternativas obrigatórias de perícias |
| Condições | 32 | 32 | Texto do anexo de playtest, procedência e regras gerais de duração e acúmulo |

Novos catálogos: **35 origens completas**, **29 perícias**, **11 serviços**, **23 modificações**, **6 materiais especiais** com preços adicionais e **6 faixas de custo de modificações**. Os poderes únicos de origem já existiam; faltavam as próprias origens com descrição, itens e opções de benefícios.

Os campos antigos usados pela aplicação foram mantidos. As descrições continuam contendo as regras necessárias à leitura, mesmo quando também há uma representação estruturada em `pre_requisitos`, `aprimoramentos`, `efeitos` ou outros campos. `gastoPe` indica custo fixo ou mínimo explícito quando identificado; custos variáveis e exceções continuam na descrição. Uma habilidade que concede uma magia não implica conjuração gratuita quando `gastoPe` é `null`.

`dadoDeDano` mantém uma fórmula aceita pelo rolador. Danos alternativos da espada bastarda e do bordão ficam também em `dano_tabela`/`danos_alternativos`, sem inserir uma barra incompatível com o parser. Munições e rede não recebem dados de dano fictícios: usam a expressão numérica `0`, com suas regras na descrição.

## Correções relevantes

- Pistola e mosquete eram classificados como armas simples. Agora pertencem à categoria de armas de fogo.
- Faltavam arco longo, besta pesada, chicote, espada bastarda, katana, machado anão, corrente com cravos, machado táurico, munição de armas de fogo e rede.
- Poderes haviam perdido níveis mínimos, ações, duração, testes de resistência e restrições. A revisão inclui os quadros compartilhados de posturas, missas, armadilhas, bravatas, julgamentos, virtudes, familiares, companheiros e montaria sagrada, além das opções de Golpe Pessoal.
- O humano tinha `+2` cadastrado em todos os seis atributos, embora deva escolher três. Lefou e osteon não tinham a penalidade fixa representada numericamente. Os dados agora separam bônus escolhidos, atributos excluídos e penalidades fixas.
- O formulário oferecia origens sem correspondência no livro e omitia outras, como Amnésico e Circense. Agora suas opções vêm do catálogo revisado.
- A lista de divindades do formulário incluía Glórienn e omitia Thwor. Ela agora vem dos 20 registros de divindade.
- O livro tem **14 classes**. Feiticeiro é um caminho de Arcanista. O formulário usa as 14 classes do catálogo; o cálculo de valores iniciais preserva o nome antigo Feiticeiro como alias para fichas existentes.

Ajustes na aplicação limitam-se a consumir as listas revisadas, compartilhar o JSON de valores iniciais e respeitar as escolhas raciais. Os dados não automatizam todas as restrições de classe, devoção, origem ou habilidade. Por exemplo, `sem_origem` registra a regra do golem; não foi implementado um novo fluxo de validação de todas as regras de criação. Os catálogos adicionais de serviços, perícias, materiais e modificações não receberam telas específicas nesta revisão.

## Divergências e limites da própria fonte

- **Thyatis:** a tabela e o perfil listam Dom da Verdade, mas o cabeçalho desse poder o atribui a Khalmyr. Dom da Ressurreição tem Thyatis no cabeçalho, embora não apareça na lista dele. Ambas as informações foram registradas, com observações de inconsistência. Não foi presumida uma errata.
- **Água Benta:** tem descrição, mas não tem preço ou peso na tabela desta prévia. Esses valores ficam `null`, com observação; não são itens gratuitos.
- **Deflagração de Mana:** o bloco não informa duração. O campo fica `null` e a lacuna é registrada.
- **Rede:** a tabela imprime 13 kg e posiciona a linha depois das armas de fogo. O peso foi preservado; a classificação como arma exótica de arremesso é identificada como inferência pendente de confirmação em edição revisada.
- **Nomes variantes:** tabelas e descrições divergem em nomes como Armas da Ambição/Armas de Valkaria, Encouraçado/Estilo Encouraçado e Parceiro/Parceiro Animal. Os aliases permitem reconhecer essas variantes sem duplicar o benefício.
- **Navegação:** aparece nas listas de perícias de Bucaneiro e Ladino, enquanto o capítulo de perícias descreve Pilotagem. A divergência foi registrada sem substituir automaticamente uma pela outra.
- **Modificações:** o exemplo textual de adicionar uma terceira modificação não corresponde à diferença entre os preços da tabela. O catálogo de custos segue os valores da tabela.
- **Confusão:** Transmissão da Loucura menciona essa magia, mas sua descrição não consta na seção de magias fornecida. Não foi inventada uma ficha para ela.
- **Condições:** pertencem às páginas 160–161 do playtest anexado, posições 292–293 do PDF. Essa procedência está explícita e não foi apresentada como apêndice definitivo da edição final.

Os 17 registros anteriores não localizados são identificados individualmente por `fonte: null` e `verificacao`: Golpe Elemental (Bardo) e 16 poderes gerais. Suas descrições foram preservadas, sem atribuição indevida ao PDF. A lista nominal está no arquivo de auditoria.

Esta revisão cobre os catálogos de personagem e regras correspondentes. Não cria bancos de ameaças, NPCs, história do cenário ou tesouros mágicos. O material digital foi extraído separando colunas e quadros laterais; as tabelas e casos problemáticos receberam conferência dirigida. Isso não equivale a uma comparação independente com a edição final ou com todas as erratas publicadas.

## Listas de aprimoramentos das magias

A conferência dos marcadores de aprimoramento e truque no PDF identificou **507 aprimoramentos e 16 truques** nas 198 magias. A lista inclui os cinco cabeçalhos com restrição entre parênteses que não estavam separados anteriormente: uma opção de Controlar o Clima e quatro opções de Luz. Curar Ferimentos conserva seus dois truques distintos.

Cada magia agora oferece:

- `descricaoBase`: efeito básico, sem repetir a lista de opções.
- `aprimoramentos`: opções independentes, inclusive quando têm o mesmo custo.
- `truques`: lista de todos os truques.

Cada opção registra `ordem`, `custoAdicional` (incluindo zero), `restricao`, `requisitos`, `circuloMinimo`, `descricao` completa e `fonte`. O círculo mínimo só é preenchido quando o texto o exige explicitamente. `fonte` indica a página da própria opção, inclusive quando ela continua depois da página em que começa a magia.

A descrição completa e o campo textual `truque` permanecem disponíveis para compatibilidade com a API. A ficha lista as opções em blocos separados, com seus custos adicionais e requisitos, tanto na lista de magias adicionadas quanto no catálogo. A janela de catálogo é exibida acima das barras da ficha e da navegação no celular. As magias retornadas pela API podem recuperar essas listas da descrição completa, sem exigir campos novos no backend. Descrições personalizadas não recebem automaticamente regras de outra magia com o mesmo nome.

## Validação

`tests/tormenta-catalogs.test.js` verifica procedência, unicidade, fórmulas de dano, relações entre divindades e poderes, origens e habilidades, consistência racial, magia e progressão. Também exercita a aplicação das penalidades e exclusões de atributos de Lefou e Osteon.

Comandos usados:

```sh
npx vitest run tests/tormenta-catalogs.test.js tests/character-wizard.test.js
npx vitest run tests/spell-details.test.js tests/tormenta-catalogs.test.js
npm test
npm run build
```

Os 45 testes focados passam e o build de produção passa, com aviso do Vite sobre tamanho de bundle. A suíte geral termina com 111 testes aprovados e quatro falhas preexistentes: duas em `character-random.test.js` e duas em `general-sheet-api.test.js`. As mesmas quatro falhas foram reproduzidas em uma cópia em `/tmp/t20-baseline`, com os dados e os trechos de implementação anteriores à revisão. Elas envolvem o contrato de resposta da criação da ficha e os testes de persistência/contadores da ficha geral.

O teste de navegador `tests/e2e/spell-options.spec.js` passou nos perfis desktop e mobile, verificando opções carregadas pela API, custos zero, restrições, dois truques na mesma magia e acesso à janela acima das barras da interface.

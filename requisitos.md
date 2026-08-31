# Requisitos —  Grimório de thanato.

## Stack Final

```
Alpine.js (frontend) → Supabase JS Client → Supabase (PostgreSQL + Auth + Realtime)
Hospedagem: Vercel (free tier)
```

---

## Decisões de Arquitetura

**Sobre o Express:** Dispensável para este escopo. O Supabase tem cliente JavaScript direto, autenticação nativa, Row Level Security (RLS) para controle de acesso por usuário, e Realtime integrado. Alpine.js conversando direto com Supabase resolve praticamente tudo. O Express só valeria a pena se houvesse lógica de servidor customizada pesada.

**Sobre hospedagem:** GitHub Pages só serve arquivos estáticos, então funciona para um projeto Alpine.js puro (sem SSR). Vercel também funciona e tem um DX melhor para projetos com variáveis de ambiente. Como haverá chaves do Supabase no frontend, **Vercel é mais recomendada** — ela gerencia env vars com mais segurança e facilidade. GitHub Pages exigiria cuidado redobrado para não expor chaves em repositório público.

---

## Requisitos Funcionais

### Autenticação
- Cadastro e login via email/senha usando Supabase Auth
- Sessão persistente (o usuário não precisa logar toda vez)
- Logout

### Personagens
- Cada usuário pode criar até **2 personagens**
- Campos da ficha baseados em Tormenta 20:
  - **Identidade:** nome, raça, classe, origem, nível, divindade
  - **Atributos:** FOR, DES, CON, INT, SAB, CAR (valor base + modificador calculado automaticamente)
  - **Valores derivados:** PV máximo, PM máximo, Defesa, Deslocamento
  - **Perícias:** lista completa de T20 com treinamento (não treinado / treinado / veterano) e bônus calculado
  - **Ataques:** campos para arma, bônus de ataque, dano
  - **Inventário:** lista de itens com quantidade e peso; campo de dinheiro (tibares)
  - **Poderes e habilidades:** lista livre com nome e descrição curta
  - **Anotações livres**

### Rolagem de Dados
- Rolador manual: d4, d6, d8, d10, d12, d20, d100
- Rolagem com um clique nas perícias e ataques direto da ficha (já soma o modificador)
- Rolagens visíveis em tempo real para todos os membros da campanha via Supabase Realtime
- Histórico das últimas N rolagens da sessão

### Campanhas
- Mestre cria campanha e recebe um código/link de convite
- Jogadores entram via código
- Limite sugerido: até **6 jogadores** por campanha
- Painel do Mestre: visualização das fichas de todos os personagens da campanha
- Tracker de iniciativa: ordem de combate com valor editável

### Aba de Referência *(nice to have — baixa prioridade)*
- Painel lateral com condições do livro (Abalado, Cego, Caído, etc.)
- Apenas leitura; conteúdo inserido manualmente no banco uma única vez
- Pode ser uma tabela estática no Supabase ou um JSON local no frontend

---

## Requisitos Não-Funcionais

- Funcionar bem em **desktop e mobile** (layout responsivo)
- Rolagens com feedback visual imediato (animação simples)
- Fichas **não podem ser perdidas** — persistência garantida pelo Supabase
- Projeto deve sobreviver ao **pause do Supabase** no free tier (um ping periódico ou script de keep-alive resolve)
- Chaves do Supabase protegidas via variáveis de ambiente na Vercel (nunca hardcoded no repositório)
- **RLS ativo** no Supabase: jogador só edita os próprios personagens; Mestre lê todos da campanha

---

## Modelagem de Dados (rascunho)

```
users              → gerenciado pelo Supabase Auth
profiles           → id, user_id, nickname, avatar_url
characters         → id, user_id, campaign_id, nome, raça, classe, origem, nível,
                     atributos (JSON), pericias (JSON), ataques (JSON),
                     inventario (JSON), poderes (JSON), anotacoes
campaigns          → id, master_id, nome, codigo_convite
campaign_members   → campaign_id, user_id, character_id
rolls_log          → id, campaign_id, user_id, character_name, descricao, resultado, created_at
conditions_ref     → id, nome, descricao   ← tabela estática de referência
```

> Os campos de atributos, perícias etc. como JSON simplificam bastante o schema sem perder nada relevante para o escopo.

---

## Pontos Abertos (definir antes de codar)

- **Nome do projeto** — vai ser "C.R.I.S." ou outro nome próprio para o Tormenta?
- **Nível** vai recalcular PV/PM automaticamente ou fica manual?
- O **Mestre** vai ter personagem próprio na campanha ou só painel de controle?

---

## Ordem de Desenvolvimento Sugerida

1. Setup Supabase (schema + RLS)
2. Autenticação
3. Ficha de personagem
4. Sistema de rolagem
5. Campanha e painel do Mestre
6. Aba de referência *(opcional)*
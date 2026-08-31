# Setup do Banco — Grimório de Thanato

Execute os comandos abaixo no **SQL Editor** do dashboard do Supabase (`https://supabase.com/dashboard/project/<seu-project>/sql/new`).

---

## 1. Tabelas

```sql
-- profiles
CREATE TABLE profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  nickname text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- characters
CREATE TABLE characters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  campaign_id uuid REFERENCES campaigns(id),
  nome text NOT NULL,
  raca text,
  classe text,
  origem text,
  nivel integer DEFAULT 1,
  divindade text,
  atributos jsonb DEFAULT '{"FOR":10,"DES":10,"CON":10,"INT":10,"SAB":10,"CAR":10}',
  pv_max integer DEFAULT 20,
  pm_max integer DEFAULT 5,
  defesa integer DEFAULT 10,
  deslocamento numeric DEFAULT 9,
  pericias jsonb DEFAULT '{}',
  ataques jsonb DEFAULT '[]',
  inventario jsonb DEFAULT '[]',
  tibares numeric DEFAULT 0,
  poderes jsonb DEFAULT '[]',
  anotacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- campaigns
CREATE TABLE campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  master_id uuid REFERENCES auth.users(id) NOT NULL,
  nome text NOT NULL,
  codigo_convite text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- campaign_members
CREATE TABLE campaign_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES campaigns(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  character_id uuid REFERENCES characters(id),
  created_at timestamptz DEFAULT now()
);

-- rolls_log
CREATE TABLE rolls_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES campaigns(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  character_name text,
  descricao text NOT NULL,
  resultado text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- conditions_ref
CREATE TABLE conditions_ref (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text UNIQUE NOT NULL,
  descricao text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

---

## 2. Índices

```sql
CREATE INDEX characters_user_id_idx ON characters(user_id);
CREATE INDEX characters_campaign_id_idx ON characters(campaign_id);
CREATE INDEX campaign_members_campaign_id_idx ON campaign_members(campaign_id);
CREATE INDEX campaign_members_user_id_idx ON campaign_members(user_id);
CREATE INDEX rolls_log_campaign_id_idx ON rolls_log(campaign_id);
CREATE INDEX campaigns_codigo_convite_idx ON campaigns(codigo_convite);
```

---

## 3. Dados iniciais (condições de referência)

```sql
INSERT INTO conditions_ref (nome, descricao) VALUES
('Abalado', 'Você sofre –2 em testes de perícia baseados em Carisma e em testes de Vontade.'),
('Agarrado', 'Você não pode se mover. Se estiver agarrado por uma criatura, sofre –2 em testes de ataque e –5 em perícias de agilidade.'),
('Atordoado', 'Você não pode realizar ações. Você sofre –5 em Defesa e perícias de Reflexos.'),
('Cego', 'Você sofre –5 em testes de perícia que dependam de visão. Testes de Percepção baseados em outros sentidos sofrem –2. Você falha automaticamente em testes que exijam visão.'),
('Caído', 'Você sofre –5 em testes de ataque corpo a corpo e –5 em Defesa contra ataques corpo a corpo. Fica vulnerável a ataques à distância (+5 em ataques à distância contra você).'),
('Confuso', 'No seu turno, role 1d6. 1: age normalmente. 2–3: fica atordoado. 4–5: ataca aliado mais próximo. 6: age normalmente, mas fica confuso por mais uma rodada.'),
('Debilitado', 'Você sofre –2 em testes de perícia e atributos físicos (FOR, DES, CON).'),
('Desprevenido', 'Você não pode somar seu bônus de Des em Defesa. Sofre –5 em Reflexos.'),
('Enjoado', 'Você sofre –2 em todos os testes de perícia e atributos, exceto Vontade.'),
('Esmorecido', 'Você não pode gastar PM. Sofre –2 em Vontade.'),
('Fascinado', 'Você não pode agir, a não ser para se aproximar da fonte do fascínio. Sofre –5 em Percepção.'),
('Fatigado', 'Você sofre –2 em FOR e DES. Após um descanso longo, recupera-se.'),
('Frustrado', 'Você sofre –2 em testes de perícia baseados em Inteligência.'),
('Imobilizado', 'Você não pode se mover. Sua Defesa sofre –5.'),
('Inconsciente', 'Você cai no chão. Não pode realizar ações. Fica desprevenido e caído.'),
('Indefeso', 'Você não pode se defender. Sua Defesa é 5. Qualquer ataque contra você é um golpe crítico automático.'),
('Inspirado', 'Você recebe +2 em todos os testes de perícia e atributos.'),
('Lento', 'Seu deslocamento é reduzido pela metade. Você sofre –2 em Defesa.'),
('Ofuscado', 'Você sofre –2 em ataques e –2 em Percepção baseada em visão.'),
('Paralisado', 'Você não pode agir. Fica desprevenido. Sofre –5 em Defesa.'),
('Pasmo', 'Você não pode agir por 1 rodada. Fica desprevenido.'),
('Sangrando', 'Você sofre 1d6 de dano por rodada no início do seu turno.'),
('Surdo', 'Você sofre –5 em Iniciativa e –2 em testes de perícia que dependam de audição.'),
('Surpreendido', 'Você não age no primeiro turno de um combate. Fica desprevenido.'),
('Tonto', 'Você sofre –2 em testes de ataque e –2 em Defesa.');
```

---

## 4. Row Level Security (RLS)

Ative RLS em cada tabela pelo **Authentication > Policies** no dashboard ou execute:

```sql
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions_ref ENABLE ROW LEVEL SECURITY;
```

Depois crie as policies manualmente pelo dashboard **Authentication > Policies > New Policy**, ou use o SQL abaixo:

### characters

```sql
CREATE POLICY "select_own" ON characters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON characters
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (SELECT COUNT(*) FROM characters WHERE user_id = auth.uid()) < 2
  );

CREATE POLICY "update_own" ON characters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own" ON characters
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "select_master" ON characters
  FOR SELECT USING (
    auth.uid() IN (SELECT master_id FROM campaigns WHERE id = campaign_id)
  );
```

### campaigns

```sql
CREATE POLICY "select_own_master" ON campaigns
  FOR SELECT USING (auth.uid() = master_id);

CREATE POLICY "select_member" ON campaigns
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM campaign_members WHERE campaign_id = id)
  );

CREATE POLICY "insert_own" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = master_id);

CREATE POLICY "update_own" ON campaigns
  FOR UPDATE USING (auth.uid() = master_id);
```

### campaign_members

```sql
CREATE POLICY "select_own" ON campaign_members
  FOR SELECT USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT master_id FROM campaigns WHERE id = campaign_id)
  );

CREATE POLICY "insert_public" ON campaign_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "delete_master" ON campaign_members
  FOR DELETE USING (
    auth.uid() IN (SELECT master_id FROM campaigns WHERE id = campaign_id)
  );
```

### conditions_ref

```sql
CREATE POLICY "select_public" ON conditions_ref
  FOR SELECT USING (true);
```

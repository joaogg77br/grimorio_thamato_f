const identityFields = ["nomeJogador", "nomePersonagem"]
const characterFields = ["raca", "classe", "origem", "nivel", "divindade", "pvCurrent", "pmCurrent", "descricao", "tamanho", "for", "int", "des", "con", "sab", "car", "pvMax", "pmMax", "deslocamento", "tibao"]
const weaponFields = ["nome", "preco", "dadoDeDano", "alcance", "peso", "tipoDano", "tipoArma", "critico", "multiplicador", "atributo", "descricao", "pericia", "equiped"]

function pick(record, fields) {
  return Object.fromEntries(fields.filter(key => record[key] !== undefined).map(key => [key, record[key]]))
}

export function buildFichaCopyPayload(ficha, jogadorId) {
  const geral = ficha.sistema === "geral"
  const payload = {
    ...pick(ficha, geral ? identityFields : [...identityFields, ...characterFields]),
    jogadorId,
    nomePersonagem: `${ficha.nomePersonagem || "Personagem sem Nome"} (cópia)`,
    pericias: ficha.pericias.map(item => pick(item, geral ? ["nome", "atributo", "treino", "outros"] : ["nome", "atributo", "metadeDoNivel", "treino", "outros"])),
  }
  const relations = geral
    ? { habilidade: ["nome", "descricao", "custo"], accounts: ["name", "currentValue", "maximumValue", "color", "accontantType"], camposSimples: ["nome", "value"] }
    : {
        armas: weaponFields,
        protecoes: ["nomeProtecao", "preco", "bonus", "penalidade", "peso", "tipoProtecao", "equipada", "descricao"],
        items: ["nome", "peso", "descricao"],
        gerais: ["tipoItemGeral", "preco"],
        magias: ["execucao", "alcance", "alvo", "duracao", "truque", "gastoPe", "descricao", "nome", "tipoMagia", "Circulo"],
        habilidades: ["nome", "descricao", "gastoPe", "classe"],
        historico: ["value"],
      }
  for (const [key, fields] of Object.entries(relations)) {
    if (ficha[key]?.length) {
      payload[key] = { create: ficha[key].map(item => {
        const copy = pick(item, fields)
        if (key === "armas" && item.modificacoes?.length) copy.modificacoes = { create: item.modificacoes.map(mod => pick(mod, ["descricao"])) }
        return copy
      }) }
    }
  }
  if (!geral && ficha.defesa) payload.defesa = pick(ficha.defesa, ["outros", "atributos"])
  return payload
}

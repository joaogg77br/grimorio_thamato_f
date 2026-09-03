const VALORES_INICIAIS_CLASSES = [

  {
    "classe": "Arcanista",
    "pv_inicial": 8,
    "pv_inicial_formula": "8 + modificador de Constituição",
    "pm_inicial_base": 6,
    "pm_inicial_formula": "6 + modificador de atributo-chave (Inteligência ou Carisma)"
  },
  {
    "classe": "Bárbaro",
    "pv_inicial": 24,
    "pv_inicial_formula": "24 + modificador de Constituição",
    "pm_inicial_base": 3,
    "pm_inicial_formula": "3 PM (fixo)"
  },
  {
    "classe": "Bardo",
    "pv_inicial": 12,
    "pv_inicial_formula": "12 + modificador de Constituição",
    "pm_inicial_base": 4,
    "pm_inicial_formula": "4 + modificador de Carisma"
  },
  {
    "classe": "Bucaneiro",
    "pv_inicial": 16,
    "pv_inicial_formula": "16 + modificador de Constituição",
    "pm_inicial_base": 3,
    "pm_inicial_formula": "3 PM (fixo)"
  },
  {
    "classe": "Caçador",
    "pv_inicial": 16,
    "pv_inicial_formula": "16 + modificador de Constituição",
    "pm_inicial_base": 4,
    "pm_inicial_formula": "4 PM (fixo)"
  },
  {
    "classe": "Cavaleiro",
    "pv_inicial": 20,
    "pv_inicial_formula": "20 + modificador de Constituição",
    "pm_inicial_base": 3,
    "pm_inicial_formula": "3 PM (fixo)"
  },
  {
    "classe": "Clérigo",
    "pv_inicial": 16,
    "pv_inicial_formula": "16 + modificador de Constituição",
    "pm_inicial_base": 5,
    "pm_inicial_formula": "5 + modificador de Sabedoria"
  },
  {
    "classe": "Druida",
    "pv_inicial": 16,
    "pv_inicial_formula": "16 + modificador de Constituição",
    "pm_inicial_base": 4,
    "pm_inicial_formula": "4 + modificador de Sabedoria"
  },
  {
    "classe": "Feiticeiro",
    "pv_inicial": 8,
    "pv_inicial_formula": "8 + modificador de Constituição",
    "pm_inicial_base": 6,
    "pm_inicial_formula": "6 + modificador de atributo-chave (Inteligência ou Carisma)"
  },
  {
    "classe": "Guerreiro",
    "pv_inicial": 20,
    "pv_inicial_formula": "20 + modificador de Constituição",
    "pm_inicial_base": 3,
    "pm_inicial_formula": "3 PM (fixo)"
  },
  {
    "classe": "Inventor",
    "pv_inicial": 12,
    "pv_inicial_formula": "12 + modificador de Constituição",
    "pm_inicial_base": 4,
    "pm_inicial_formula": "4 PM (fixo)"
  },
  {
    "classe": "Ladino",
    "pv_inicial": 12,
    "pv_inicial_formula": "12 + modificador de Constituição",
    "pm_inicial_base": 4,
    "pm_inicial_formula": "4 PM (fixo)"
  },
  {
    "classe": "Lutador",
    "pv_inicial": 20,
    "pv_inicial_formula": "20 + modificador de Constituição",
    "pm_inicial_base": 3,
    "pm_inicial_formula": "3 PM (fixo)"
  },
  {
    "classe": "Nobre",
    "pv_inicial": 16,
    "pv_inicial_formula": "16 + modificador de Constituição",
    "pm_inicial_base": 4,
    "pm_inicial_formula": "4 PM (fixo)"
  },
  {
    "classe": "Paladino",
    "pv_inicial": 20,
    "pv_inicial_formula": "20 + modificador de Constituição",
    "pm_inicial_base": 3,
    "pm_inicial_formula": "3 + modificador de Carisma"
  }
]

function modAtributo(valor) {
  const n = Math.floor(Number(valor) || 0)
  return Math.floor((n - 10) / 2)
}

function atrMod(classe, atributos) {
  const chave = VALORES_INICIAIS_CLASSES.find(c => c.classe === classe)?.atributo_chave || null
  if (!chave) return 0
  const v = String(chave).toLowerCase()
  if (v === "carisma") return modAtributo(atributos?.CAR)
  if (v === "sabedoria") return modAtributo(atributos?.SAB)
  if (v === "inteligencia") return modAtributo(atributos?.INT)
  if (v === "constituicao") return modAtributo(atributos?.CON)
  return 0
}

function calcularPV(classe, atributos) {
  const data = VALORES_INICIAIS_CLASSES.find(c => c.classe === classe)
  if (!data) return 20
  return data.pv_inicial + modAtributo(atributos?.CON)
}

function calcularPM(classe, atributos) {
  const data = VALORES_INICIAIS_CLASSES.find(c => c.classe === classe)
  if (!data) return 5
  const base = data.pm_inicial_base
  const formula = String(data.pm_inicial_formula || "").toLowerCase()
  if (formula.includes("carisma")) return base + modAtributo(atributos?.CAR)
  if (formula.includes("sabedoria")) return base + modAtributo(atributos?.SAB)
  if (formula.includes("inteligência") || formula.includes("atributo-chave")) return base + Math.max(modAtributo(atributos?.INT), modAtributo(atributos?.CAR))
  return base
}

function valoresIniciais(classe, atributos) {
  return {
    pv: calcularPV(classe, atributos),
    pm: calcularPM(classe, atributos),
  }
}

export { VALORES_INICIAIS_CLASSES, calcularPV, calcularPM, valoresIniciais, modAtributo, atrMod }

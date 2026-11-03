import valoresIniciaisClasses from "../../valores-iniciais-classes.json"

const VALORES_INICIAIS_CLASSES = [
  ...valoresIniciaisClasses,
  { ...valoresIniciaisClasses.find(classe => classe.classe === "Arcanista"), classe: "Feiticeiro" },
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

import client from "./client.js"
import { generalApi } from "./generalApi.js"
import { getProtecoesByFicha, getHistoricoByFicha } from "./userApi.js"

export async function getFichaCompleta(fichaId, sistema = "tormenta") {
  const { data } = await client.get(`/find/ficha/${encodeURIComponent(fichaId)}/${encodeURIComponent(sistema)}`)
  const ficha = data?.[sistema === "geral" ? "fichaFetchGeral" : "fichaFetchTormenta20"]
  if (!ficha?.id || String(ficha.id) !== String(fichaId)) throw new Error("Ficha não encontrada")
  const completa = { ...ficha, sistema }
  const resources = sistema === "geral"
    ? Object.fromEntries(["pericias", "habilidade", "accounts", "camposSimples"].map(type => [type, () => generalApi.list(type, fichaId)]))
    : {
        protecoes: async () => (await getProtecoesByFicha(fichaId)).data?.data,
        historico: async () => (await getHistoricoByFicha(fichaId)).data?.historico,
      }
  await Promise.all(Object.entries(resources).map(async ([key, fetch]) => {
    if (!Array.isArray(completa[key])) completa[key] = await fetch()
    if (!Array.isArray(completa[key])) throw new Error(`Não foi possível carregar ${key}`)
  }))
  if (sistema === "tormenta" && ["items", "armas", "gerais", "magias", "habilidades", "pericias"].some(key => !Array.isArray(completa[key]))) {
    throw new Error("A ficha retornada está incompleta")
  }
  return completa
}

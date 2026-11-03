import client from "./client.js"

const resources = {
  pericias: { path: "pericias", list: "pericias", record: "pericias" },
  habilidade: { path: "habilidades", list: "habilidades", record: "data" },
  accounts: { path: "accounts", list: "accounts", record: "data" },
  camposSimples: { path: "camposSimples", list: "campos", record: "data" },
}

export const generalApi = {
  async list(type, fichaId) {
    const resource = resources[type]
    const response = await client.get(`/${resource.path}/list/${fichaId}/geral`)
    const records = response.data[resource.list]
    if (!Array.isArray(records)) throw new Error("Resposta inválida ao carregar a ficha")
    return records
  },
  async save(type, fichaId, item, id = null) {
    const resource = resources[type]
    const payload = { ...item, fichaGeralId: Number(fichaId) }
    const response = id == null
      ? await client.post(`/${resource.path}/create/geral`, payload)
      : await client.put(`/${resource.path}/update/${id}/geral`, payload)
    const record = response.data[resource.record]
    if (!record?.id) throw new Error("Resposta inválida ao salvar o elemento")
    return record
  },
  async remove(type, id) {
    const resource = resources[type]
    if (type === "pericias") throw new Error("A API ainda não oferece exclusão de perícias")
    const url = `/${resource.path}/delete/${id}/geral`
    if (["habilidade"].includes(type)) await client.post(url)
    else await client.delete(url)
  },
}

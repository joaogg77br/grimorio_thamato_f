import client from "./client.js"
import { limparEmojiClasse } from "../data/classes.js"
import { limparEmojiRaca } from "../data/racas.js"

function createUser({ nome, emailUser, password }) {
  return client.post("/create/user", { nome, emailUser, password })
}

function loginUser({ email, password }) {
  return client.post("/login", { email, password })
}

function checkLogged({ token, email }) {
  return client.post("/logged", { token, email })
}

function updateUser(userId, data) {
  return client.put(`/update/user/${userId}`, data)
}

function getFichasByUser(userId) {
  return client.get(`/todasAsFichas/${userId}`).then(response => {
    const userData = response.data?.data
    const fichas = Array.isArray(userData)
      ? userData
      : [
          ...(Array.isArray(userData?.fichaTormenta) ? userData.fichaTormenta.map(ficha => ({ ...ficha, sistema: "tormenta" })) : []),
          ...(Array.isArray(userData?.fichaGeral) ? userData.fichaGeral.map(ficha => ({ ...ficha, sistema: "geral" })) : []),
        ]

    return {
      ...response,
      data: {
        ...response.data,
        data: fichas.map(ficha => ({ ...ficha, classe: limparEmojiClasse(ficha.classe), raca: limparEmojiRaca(ficha.raca) })),
      },
    }
  })
}

function createFicha(data, sistema = "tormenta") {
  const { jogadorId, pericias = [], ...fichaFields } = data
  if (Object.hasOwn(fichaFields, "for_")) {
    fichaFields.for = fichaFields.for_
    delete fichaFields.for_
  }
  if (Object.hasOwn(fichaFields, "int_")) {
    fichaFields.int = fichaFields.int_
    delete fichaFields.int_
  }
  if (fichaFields.defesa) {
    const { atributo, ...defesa } = fichaFields.defesa
    fichaFields.defesa = { create: { ...defesa, atributos: defesa.atributos || atributo || "DES" } }
  }
  return client.post(`/create/personagem/${encodeURIComponent(sistema)}`, {
    jogadorId,
    fichaFields,
    pericias,
  })
}

function updateFicha(fichaId, data, sistema = "tormenta") {
  const content = { ...data }
  if (Object.hasOwn(content, "for_")) {
    content.for = content.for_
    delete content.for_
  }
  if (Object.hasOwn(content, "int_")) {
    content.int = content.int_
    delete content.int_
  }
  delete content.defesaId
  if (content.defesa) {
    const { atributo, ...defesa } = content.defesa
    content.defesa = {
      upsert: {
        create: { ...defesa, atributos: defesa.atributos || atributo || "DES" },
        update: { ...defesa, atributos: defesa.atributos || atributo || "DES" },
      },
    }
  }
  return client.put(`/atualize/ficha/personagem/${fichaId}/${encodeURIComponent(sistema)}`, { ...data, content })
}

function deleteFicha(fichaId, sistema = "tormenta") {
  return client.delete(`/deleteFicha/${fichaId}/${encodeURIComponent(sistema)}`)
}

function findCampanhas(fichaId) {
  return client.get(`/find/ficha/CampanhaAtiva/${fichaId}`)
}
function createArma(data) {
  return client.post("/equipamentos/create/Armas", data)
}

function getArmasByFicha(fichaId) {
  return client.get(`/equipamentos/listAll/Armas/${fichaId}`)
}

function deleteArma(armaId) {
  return client.delete(`/equipamentos/delete/Armas/${armaId}`)
}

function updateArma(armaId, data) {
  return client.put(`/equipamentos/update/Armas/${armaId}`, data)
}

function createProtecao(data) {
  return client.post("/equipamentos/create/Protecao", data)
}

function getProtecoesByFicha(fichaId) {
  return client.get(`/equipamentos/listAll/Protecao/${fichaId}`)
}

function deleteProtecao(protecaoId) {
  return client.delete(`/equipamentos/delete/Protecao/${protecaoId}`)
}

function updateProtecaoEquipada(protecaoId, equiped) {
  return client.post(`/protecoes/atualize/equiped/${protecaoId}`, { equiped })
}

function updateProtecao(protecaoId, data) {
  return client.put(`/equipamentos/update/Protecao/${protecaoId}`, data)
}

function createEquipamento(data) {
  return client.post("/equipamentos/create/Item", data)
}

function getEquipamentosByFicha(fichaId) {
  return client.get(`/equipamentos/listAll/Item/${fichaId}`)
}

function deleteEquipamento(itemId) {
  return client.delete(`/equipamentos/delete/Item/${itemId}`)
}

function updateEquipamento(itemId, data) {
  return client.put(`/equipamentos/update/Item/${itemId}`, data)
}

function createItemGeral(data) {
  return client.post("/equipamentos/create/Geral", data)
}

function getItensGeraisByFicha(fichaId) {
  return client.get(`/equipamentos/listAll/Geral/${fichaId}`)
}

function getItemGeral(itemId) {
  return client.get(`/equipamentos/get/Geral/${itemId}`)
}

function updateItemGeral(itemId, data) {
  return client.put(`/equipamentos/update/Geral/${itemId}`, data)
}

function deleteItemGeral(itemId) {
  return client.delete(`/equipamentos/delete/Geral/${itemId}`)
}

function getAllEquipamentosByFicha(fichaId) {
  return client.get(`/equipamentos/listAll/${fichaId}`)
}

function createMagia(data) {
  return client.post("/magias/create/", data)
}

function getMagiasByFicha(fichaId) {
  return client.get(`/magias/list/${fichaId}`)
}

function deleteMagia(magiaId) {
  return client.delete(`/magias/delete/${magiaId}`)
}

function updateMagia(magiaId, fichaId, data) {
  return client.put(`/magia/update/${magiaId}/${fichaId}`, data)
}

function createHabilidade(data) {
  return client.post("/habilidades/create/", data)
}

function getHabilidadesByFicha(fichaId) {
  return client.get(`/habilidades/list/${fichaId}`)
}

function deleteHabilidade(habilidadeId) {
  return client.post(`/habilidades/delete/${habilidadeId}`)
}

function updateHabilidade(habilidadeId, data) {
  return client.put(`/habilidades/update/${habilidadeId}`, data)
}

function getPericiasByFicha(fichaId) {
  return client.get(`/pericias/list/${fichaId}`)
}

function updatePericia(periciaId, data) {
  return client.put(`/pericias/update/${periciaId}`, data)
}

function createCampanha(data) {
  return client.post("/campanha/create/", data)
}

function getCampanhasByMaster(playerMestreId) {
  return client.get(`/campanha/listMestre/${playerMestreId}`)
}

function getCampanhasByUser(userId) {
  return client.get(`/campanha/list/${userId}`)
}

function findCampanhaByChaveLink(chaveLink, userId) {
  return client.post(`/campanha/find/${chaveLink}`, { userId })
}

function getPlayersByCampanha(campanhaId) {
  return client.get(`/campanha/list/players/${campanhaId}`)
}

function removePlayerFromCampanha(playerId, campanhaId) {
  return client.delete(`/campanha/mestre/remove/${playerId}/${campanhaId}`)
}

function leaveCampanha(playerId, campanhaId) {
  return client.delete(`/campanha/remove/${playerId}/${campanhaId}`)
}

function deleteCampanha(campanhaId) {
  return client.delete(`/campanha/delete/${campanhaId}`)
}

function addFichaToCampanha(campanhaId, fichaId) {
  return client.post(`/ficha/add/${campanhaId}/${fichaId}`)
}

function getFichasByCampanha(campanhaId) {
  return client.get(`/campanha/mestre/list/fichas/${campanhaId}`)
}

function removeFichaFromCampanha(campanhaId, fichaId) {
  return client.delete(`/ficha/remove/${campanhaId}/${fichaId}`)
}

function createHistorico(fichaId, value) {
  return client.post(`/historico/create/${fichaId}`, { value })
}

function getHistoricoByFicha(fichaId) {
  return client.get(`/historico/list/${fichaId}`)
}

function deleteHistorico(historicoId) {
  return client.delete(`/historico/delete/${historicoId}`)
}

function updateHistorico(historicoId, value) {
  return client.put(`/historico/update/${historicoId}`, { value })
}

export { createUser, loginUser, checkLogged, updateUser, getFichasByUser, findCampanhas, createFicha, updateFicha, deleteFicha, createArma, getArmasByFicha, deleteArma, updateArma, createProtecao, getProtecoesByFicha, deleteProtecao, updateProtecaoEquipada, updateProtecao, createEquipamento, getEquipamentosByFicha, getAllEquipamentosByFicha, deleteEquipamento, updateEquipamento, createItemGeral, getItensGeraisByFicha, getItemGeral, updateItemGeral, deleteItemGeral, createMagia, getMagiasByFicha, deleteMagia, updateMagia, createHabilidade, getHabilidadesByFicha, deleteHabilidade, updateHabilidade, getPericiasByFicha, updatePericia, createCampanha, getCampanhasByMaster, getCampanhasByUser, findCampanhaByChaveLink, getPlayersByCampanha, removePlayerFromCampanha, leaveCampanha, deleteCampanha, addFichaToCampanha, getFichasByCampanha, removeFichaFromCampanha, createHistorico, getHistoricoByFicha, deleteHistorico, updateHistorico }

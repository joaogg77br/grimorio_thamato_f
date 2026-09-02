import client from "./client.js"

function createUser({ nome, emailUser }) {
  return client.post("/create/user", { nome, emailUser })
}

function findAllUsers() {
  return client.get("/find/allusers")
}

function loginUser({ emailOrNickName }) {
  return client.post("/login", { emailOrNickName })
}

function getFichasByUser(userId) {
  return client.get(`/todasAsFichas/${userId}`)
}

function createFicha(data) {
  return client.post("/create/personagem", data)
}

function updateFicha(fichaId, data) {
  return client.put(`/atualize/ficha/personagem/${fichaId}`, data)
}

function deleteFicha(fichaId) {
  return client.delete(`/deleteFicha/${fichaId}`)
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

export { createUser, findAllUsers, loginUser, getFichasByUser, createFicha, updateFicha, deleteFicha, createArma, getArmasByFicha, deleteArma, updateArma, createProtecao, getProtecoesByFicha, deleteProtecao, updateProtecaoEquipada, updateProtecao, createEquipamento, getEquipamentosByFicha, deleteEquipamento, updateEquipamento, createMagia, getMagiasByFicha, deleteMagia, updateMagia, createHabilidade, getHabilidadesByFicha, deleteHabilidade, updateHabilidade, getPericiasByFicha, updatePericia, createCampanha, getCampanhasByMaster, getCampanhasByUser, findCampanhaByChaveLink, getPlayersByCampanha, removePlayerFromCampanha, deleteCampanha, addFichaToCampanha, getFichasByCampanha, removeFichaFromCampanha }

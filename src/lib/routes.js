import socket from "./socket.js"
import { findCampanhaByChaveLink, findCampanhaById } from "../useApi"
export const FICHA_SECTIONS = ["pericias", "inventario", "magias", "habilidades", "descricao", "ataques"]
export const FICHA_PATHS = ["/personagens/ficha", ...FICHA_SECTIONS.map(section => `/personagens/ficha/${section}`)]
export const PUBLIC_PATHS = ["/", "/cadastro"]
export const APP_PATHS = [...PUBLIC_PATHS, "/inicio", "/personagens", ...FICHA_PATHS, "/campanhas", "/campanhas/minhas", "/campanhas/entrar", "/mestre", "/referencia", "/perfil"]

export  function fichaPath(section = "pericias", id = null, sistema = "tormenta", campanhaId = null) {
  if (campanhaId) messageBox.style.display = "flex";
    else  messageBox.style.display = "none";
  const salaChave = localStorage.getItem("sala-chave");

  async function connectOrCreateRoom() {
    findCampanhaById(campanhaId)
      .then(e => {
        const chave = e.data.campanhaFind.chaveLink;
        const sala = localStorage.setItem("sala-chave", chave)
        socket.emit("entrarSala",{salaId:sala})
      });
  }
  connectOrCreateRoom();

  const path = `/personagens/ficha/${FICHA_SECTIONS.includes(section) ? section : "pericias"}`
  if (id == null) return path
  const query = { id: String(id) }
  if (sistema === "geral") query.sistema = sistema
  return `${path}?${new URLSearchParams(query)}`
}

export function fichaSection(router) {
  return FICHA_SECTIONS.find(section => router.is(`/personagens/ficha/${section}`)) || "pericias"
}

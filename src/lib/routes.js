export const FICHA_SECTIONS = ["pericias", "inventario", "magias", "habilidades", "descricao", "ataques", "historico"]
export const FICHA_PATHS = ["/personagens/ficha", ...FICHA_SECTIONS.map(section => `/personagens/ficha/${section}`)]
export const PUBLIC_PATHS = ["/", "/cadastro"]
export const APP_PATHS = [...PUBLIC_PATHS, "/inicio", "/personagens", ...FICHA_PATHS, "/campanhas", "/campanhas/minhas", "/campanhas/entrar", "/mestre", "/referencia", "/perfil"]

export function fichaPath(section = "pericias", id = null) {
  const path = `/personagens/ficha/${FICHA_SECTIONS.includes(section) ? section : "pericias"}`
  return id == null ? path : `${path}?${new URLSearchParams({ id: String(id) })}`
}

export function fichaSection(router) {
  return FICHA_SECTIONS.find(section => router.is(`/personagens/ficha/${section}`)) || "pericias"
}

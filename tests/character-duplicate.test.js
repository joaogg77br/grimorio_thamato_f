import { beforeEach, describe, expect, it, vi } from "vitest"
import client from "../src/useApi/client.js"
import { createCharacter, deferred } from "./helpers/character.js"

vi.mock("../src/useApi/client.js", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }))

function tormenta() {
  return {
    id: 7, jogadorId: 1, campanhaId: 30, nomePersonagem: "Arin", nomeJogador: "Jogador",
    raca: "Humano", classe: "Guerreiro", origem: "Soldado", nivel: 5, divindade: null,
    for: 18, int: 0, des: 12, con: 14, sab: 10, car: 8,
    pvCurrent: 0, pvMax: 50, pmCurrent: 0, pmMax: 10, deslocamento: 9, tibao: 0, descricao: "História", tamanho: "Médio",
    defesa: { id: 2, fichaId: 7, outros: 0, atributos: "DES" },
    pericias: [{ id: 3, fichaId: 7, nome: "Ofício (Armeiro)", atributo: "INT", metadeDoNivel: 2, treino: 4, outros: -1 }],
    armas: [{ id: 4, fichaId: 7, nome: "Espada", preco: 10, dadoDeDano: "1d8", alcance: "Corpo a corpo", peso: 1, tipoDano: "Corte", tipoArma: "Marcial", critico: 19, multiplicador: 2, atributo: "FOR", pericia: "luta", equiped: true, descricao: "Espada favorita" }],
    items: [{ id: 5, fichaId: 7, nome: "Corda", peso: 1, descricao: "10 metros" }],
    gerais: [{ id: 6, fichaId: 7, tipoItemGeral: "Poção", preco: 20 }],
    magias: [{ id: 8, fichaId: 7, nome: "Luz", execucao: "Padrão", alcance: "Curto", alvo: "Objeto", duracao: "Cena", truque: null, gastoPe: 0, descricao: "Ilumina", tipoMagia: "Universal", Circulo: "1" }],
    habilidades: [{ id: 9, fichaId: 7, nome: "Poder", descricao: "Efeito", gastoPe: null, classe: "Guerreiro" }],
  }
}

function prepare(source = tormenta(), sistema = "tormenta") {
  const state = createCharacter()
  state.fichasOwnerId = "test-user"
  state.fichasLoaded = true
  state.fichasApi = [{ id: 7, nomePersonagem: "Resumo", sistema }]
  client.get.mockImplementation(async url => {
    if (url.startsWith("/find/ficha/")) return { data: { [sistema === "geral" ? "fichaFetchGeral" : "fichaFetchTormenta20"]: source } }
    if (url.startsWith("/equipamentos/listAll/Protecao/")) return { data: { data: [{ id: 12, fichaId: 7, nomeProtecao: "Escudo", preco: 10, bonus: 2, penalidade: -1, peso: 2, tipoProtecao: "Escudo", equipada: true, descricao: "Escudo" }] } }
    if (url.startsWith("/historico/list/")) return { data: { historico: [{ id: 13, fichaId: 7, value: "Rolagem" }] } }
    if (url.startsWith("/todasAsFichas/")) return { data: { data: [{ id: 7, nomePersonagem: "Arin", sistema }, { id: 20, nomePersonagem: "Arin (cópia)", sistema }] } }
    if (url.startsWith("/pericias/list/")) return { data: { pericias: [{ id: 1, fichaGeralId: 7, nome: "Luta", atributo: "Força", treino: 0, outros: -2 }] } }
    if (url.startsWith("/habilidades/list/")) return { data: { habilidades: [{ id: 2, fichaGeralId: 7, nome: "Poder", descricao: "Efeito", custo: null }] } }
    if (url.startsWith("/accounts/list/")) return { data: { accounts: [{ id: 3, fichaGeralId: 7, name: "Vida", currentValue: 0, maximumValue: 20, color: "#15803d", accontantType: "bar" }] } }
    if (url.startsWith("/camposSimples/list/")) return { data: { campos: [{ id: 4, fichaGeralId: 7, nome: "Origem", value: "Arton" }] } }
    throw new Error(`Rota inesperada: ${url}`)
  })
  client.post.mockResolvedValue({ data: { [sistema === "geral" ? "fichaGeral" : "tormentaFicha"]: { id: 20 } } })
  return state
}

describe("Duplicação de fichas", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => {})
    const storage = new Map()
    vi.stubGlobal("localStorage", { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) })
  })

  it("busca a ficha completa e cria novos registros sem IDs ou vínculos com a campanha", async () => {
    const source = tormenta(), original = structuredClone(source)
    const state = prepare(source)
    await state.duplicarFichaCard(state.fichasApi[0])
    expect(client.get).toHaveBeenCalledWith("/find/ficha/7/tormenta")
    expect(client.get).toHaveBeenCalledWith("/equipamentos/listAll/Protecao/7")
    const [url, request] = client.post.mock.calls[0]
    expect(url).toBe("/create/personagem/tormenta")
    expect(request.jogadorId).toBe("test-user")
    expect(request.fichaFields).toMatchObject({ nomePersonagem: "Arin (cópia)", for: 18, int: 0, pvCurrent: 0, pmCurrent: 0, tibao: 0, defesa: { create: { outros: 0, atributos: "DES" } } })
    expect(request.pericias).toEqual([{ nome: "Ofício (Armeiro)", atributo: "INT", metadeDoNivel: 2, treino: 4, outros: -1 }])
    for (const key of ["armas", "protecoes", "items", "gerais", "magias", "habilidades", "historico"]) {
      expect(request.fichaFields[key].create).toHaveLength(1)
      expect(request.fichaFields[key].create[0]).not.toHaveProperty("id")
      expect(request.fichaFields[key].create[0]).not.toHaveProperty("fichaId")
    }
    expect(request.fichaFields.armas.create[0].equiped).toBe(true)
    expect(request.fichaFields.protecoes.create[0].equipada).toBe(true)
    expect(request.fichaFields).not.toHaveProperty("id")
    expect(request.fichaFields).not.toHaveProperty("campanhaId")
    expect(request.fichaFields).not.toHaveProperty("jogadorId")
    expect(source).toEqual(original)
    expect(state.fichasApi.map(item => item.id)).toEqual([7, 20])
    expect(state.selectedCharId).toBeNull()
    expect(state.$router.push).not.toHaveBeenCalled()
    expect(state.$store.toasts.push).toHaveBeenCalledWith("Ficha duplicada com sucesso!", "success")
    expect(state.duplicatingFicha).toBeNull()
  })

  it("reutiliza relações completas sem refazer as buscas", async () => {
    const state = prepare({ ...tormenta(), protecoes: [], historico: [] })
    await state.duplicarFichaCard(state.fichasApi[0])
    expect(client.get.mock.calls.map(([url]) => url)).toEqual(["/find/ficha/7/tormenta", "/todasAsFichas/test-user"])
  })

  it.each(["busca", "proteções", "criação", "incompleta", "ausente"])("trata falha de %s sem informar sucesso ou alterar o original", async failure => {
    const state = prepare()
    if (failure === "busca") client.get.mockRejectedValueOnce(new Error("offline"))
    if (failure === "proteções") client.get.mockImplementationOnce(async () => ({ data: { fichaFetchTormenta20: { ...tormenta(), historico: [] } } })).mockRejectedValueOnce(new Error("offline"))
    if (failure === "criação") client.post.mockRejectedValueOnce(new Error("offline"))
    if (failure === "incompleta") client.get.mockResolvedValueOnce({ data: { fichaFetchTormenta20: { id: 7, protecoes: [], historico: [] } } })
    if (failure === "ausente") client.get.mockResolvedValueOnce({ data: { fichaFetchTormenta20: null } })
    await state.duplicarFichaCard(state.fichasApi[0])
    if (failure !== "criação") expect(client.post).not.toHaveBeenCalled()
    expect(state.fichasApi).toHaveLength(1)
    expect(state.$store.toasts.push).toHaveBeenCalledWith(expect.any(String), "error")
    expect(state.duplicatingFicha).toBeNull()
  })

  it("impede duplo clique e exclusão durante a duplicação", async () => {
    const state = prepare(), pending = deferred()
    client.get.mockReturnValueOnce(pending.promise)
    const first = state.duplicarFichaCard(state.fichasApi[0])
    expect(state.duplicatingFicha).toBe("tormenta:7")
    await state.duplicarFichaCard(state.fichasApi[0])
    await state.deleteFichaCard(state.fichasApi[0])
    expect(client.get).toHaveBeenCalledTimes(1)
    expect(client.delete).not.toHaveBeenCalled()
    pending.resolve({ data: { fichaFetchTormenta20: tormenta() } })
    await first
    expect(client.post).toHaveBeenCalledTimes(1)
  })

  it("não cria uma cópia em outra conta se a sessão mudar durante a busca", async () => {
    const state = prepare(), pending = deferred()
    client.get.mockReturnValueOnce(pending.promise)
    const first = state.duplicarFichaCard(state.fichasApi[0])
    state.$store.auth.user = { id: "outro" }
    pending.resolve({ data: { fichaFetchTormenta20: tormenta() } })
    await first
    expect(client.post).not.toHaveBeenCalled()
    expect(state.duplicatingFicha).toBeNull()
  })

  it("mantém a cópia visível quando atualizar a lista falha", async () => {
    const state = prepare({ ...tormenta(), protecoes: [], historico: [] })
    client.get.mockImplementationOnce(async () => ({ data: { fichaFetchTormenta20: { ...tormenta(), protecoes: [], historico: [] } } })).mockRejectedValueOnce(new Error("offline"))
    await state.duplicarFichaCard(state.fichasApi[0])
    expect(state.fichasApi.map(item => item.id)).toEqual([7, 20])
    expect(state.fichasApi[1]).not.toHaveProperty("campanhaId")
    expect(state.$store.toasts.push).toHaveBeenCalledWith("Ficha duplicada com sucesso!", "success")
  })

  it("duplica a ficha geral com recursos remotos e elementos locais independentes", async () => {
    const state = prepare({ id: 7, nomePersonagem: "Arin", nomeJogador: "Jogador", jogadorId: 1 }, "geral")
    localStorage.setItem("grimorio_general_ficha_7", JSON.stringify({
      armas: [{ id: "arma-antiga", nome: "Espada", dadoDeDano: "1d8" }],
      defesa: [{ id: "defesa-antiga", atributos: "Agilidade", outros: 2 }],
      historico: [{ id: "historico-antigo", value: "Aventura" }],
      camposSimples: [{ id: "campo-local", _generalLocal: true, nome: "Segredo", value: "Texto" }],
      accounts: [{ id: 3, name: "Cache antigo", currentValue: 99 }],
    }))
    const original = localStorage.getItem("grimorio_general_ficha_7")
    await state.duplicarFichaCard(state.fichasApi[0])
    expect(client.get).toHaveBeenCalledWith("/find/ficha/7/geral")
    const [url, request] = client.post.mock.calls[0]
    expect(url).toBe("/create/personagem/geral")
    expect(request.fichaFields.accounts.create).toEqual([{ name: "Vida", currentValue: 0, maximumValue: 20, color: "#15803d", accontantType: "bar" }])
    expect(request.fichaFields.habilidade.create).toEqual([{ nome: "Poder", descricao: "Efeito", custo: null }])
    expect(request.fichaFields.camposSimples.create).toEqual([{ nome: "Origem", value: "Arton" }, { nome: "Segredo", value: "Texto" }])
    expect(request.pericias).toEqual([{ nome: "Luta", atributo: "Força", treino: 0, outros: -2 }])
    const saved = JSON.parse(localStorage.getItem("grimorio_general_ficha_20"))
    expect(saved.armas[0]).toMatchObject({ nome: "Espada", dadoDeDano: "1d8", _generalLocal: true })
    expect(saved.armas[0].id).not.toBe("arma-antiga")
    expect(saved.defesa[0].id).not.toBe("defesa-antiga")
    expect(saved.historico[0].value).toBe("Aventura")
    expect(localStorage.getItem("grimorio_general_ficha_7")).toBe(original)
  })
})

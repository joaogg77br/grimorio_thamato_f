import { beforeEach, describe, expect, it, vi } from "vitest"
import client from "../src/useApi/client.js"
import { createCharacter, deferred } from "./helpers/character.js"

vi.mock("../src/useApi/client.js", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }))

function sheet() {
  const state = createCharacter()
  state.selectedCharId = 9
  state.currentFichaSystem = "geral"
  state.$refs = { generalEditor: { focus: vi.fn() } }
  return state
}

describe("Ficha geral conectada à API", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    const storage = new Map()
    vi.stubGlobal("localStorage", {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    })
  })

  it("cria perícia geral enviando somente os campos do schema e usa o ID retornado", async () => {
    const state = sheet()
    state.openGeneralEditor("pericias")
    state.generalDraft = { nome: "Investigar", atributo: "Intelecto", treino: 0, outros: -1, metadeDoNivel: 10 }
    client.post.mockResolvedValue({ data: { pericias: { id: 12, nome: "Investigar", atributo: "Intelecto", treino: 0, outros: -1 } } })
    await state.saveGeneralElement()
    expect(client.post).toHaveBeenCalledWith("/pericias/create/geral", { nome: "Investigar", atributo: "Intelecto", treino: 0, outros: -1, fichaGeralId: 9 })
    expect(state.generalCharacter.pericias[0].id).toBe(12)
    expect(state.generalEditorOpen).toBe(false)
  })

  it("edita habilidade com custo nulo e sem os campos de Tormenta20", async () => {
    const state = sheet()
    const item = { id: 2, nome: "Poder", descricao: "Efeito", custo: 2 }
    state.generalCharacter.habilidade = [item]
    state.openGeneralEditor("habilidade", item, 0)
    state.generalDraft.custo = ""
    client.put.mockResolvedValue({ data: { data: { ...item, custo: null } } })
    await state.saveGeneralElement()
    expect(client.put).toHaveBeenCalledWith("/habilidades/update/2/geral", { nome: "Poder", descricao: "Efeito", custo: null, fichaGeralId: 9 })
    expect(state.generalCharacter.habilidade[0].custo).toBeNull()
  })

  it("preserva o formulário e a lista quando a API falha", async () => {
    const state = sheet()
    state.openGeneralEditor("accounts")
    state.generalDraft = { name: "Vida", value: 20, accontantType: "bar" }
    client.post.mockRejectedValue(new Error("offline"))
    await state.saveGeneralElement()
    expect(state.generalEditorOpen).toBe(true)
    expect(state.generalDraft.value).toBe(20)
    expect(state.generalCharacter.accounts).toEqual([])
    expect(state.generalSaving).toBe(false)
    expect(state.$store.toasts.push).toHaveBeenCalledWith(expect.any(String), "error")
  })

  it("bloqueia envios duplicados enquanto aguarda a resposta", async () => {
    const state = sheet(), pending = deferred()
    state.openGeneralEditor("accounts")
    state.generalDraft = { name: "Vida", value: 20, accontantType: "bar" }
    client.post.mockReturnValue(pending.promise)
    const first = state.saveGeneralElement()
    await state.saveGeneralElement()
    expect(client.post).toHaveBeenCalledTimes(1)
    pending.resolve({ data: { data: { id: 3, name: "Vida", value: 20, accontantType: "bar" } } })
    await first
  })

  it("carrega cada recurso por sistema e permite recuperação parcial", async () => {
    const state = sheet()
    state.generalCharacter.accounts = [{ id: 3, name: "Vida", value: 10 }]
    client.get.mockImplementation(url => {
      if (url.startsWith("/accounts")) return Promise.reject(new Error("offline"))
      if (url.startsWith("/pericias")) return Promise.resolve({ data: { pericias: [{ id: 4, nome: "Luta" }] } })
      return Promise.resolve({ data: { habilidades: [] } })
    })
    await state.loadGeneralRemoteElements()
    expect(client.get).toHaveBeenCalledWith("/pericias/list/9/geral")
    expect(client.get).toHaveBeenCalledWith("/habilidades/list/9/geral")
    expect(client.get).toHaveBeenCalledWith("/accounts/list/9/geral")
    expect(state.generalCharacter.pericias[0].id).toBe(4)
    expect(state.generalCharacter.accounts[0].value).toBe(10)
    expect(state.generalLoadError).toContain("contadores")
  })

  it("ignora carregamento de uma ficha que já foi fechada", async () => {
    const state = sheet(), pending = deferred()
    client.get.mockReturnValue(pending.promise)
    const loading = state.loadGeneralRemoteElements()
    state.generalCharacter = { pericias: [], habilidade: [], accounts: [] }
    state.selectedCharId = 10
    pending.resolve({ data: { pericias: [{ id: 4 }], habilidades: [], accounts: [] } })
    await loading
    expect(state.generalCharacter.pericias).toEqual([])
  })

  it("atualiza contador para zero somente após confirmação do servidor", async () => {
    const state = sheet(), item = { id: 3, name: "Vida", value: 1 }
    client.put.mockResolvedValue({ data: { data: { ...item, value: 0 } } })
    await state.changeGeneralAccount(item, 0)
    expect(client.put).toHaveBeenCalledWith("/accounts/update/3/geral", { value: 0, fichaGeralId: 9 })
    expect(item.value).toBe(0)
  })

  it("mantém o registro se a exclusão falhar e usa POST para excluir habilidade", async () => {
    const state = sheet()
    state.generalCharacter.habilidade = [{ id: 2, nome: "Poder" }]
    client.post.mockRejectedValue(new Error("offline"))
    await state.removeGeneralElement("habilidade", 0)
    expect(client.post).toHaveBeenCalledWith("/habilidades/delete/2/geral")
    expect(state.generalCharacter.habilidade).toHaveLength(1)
  })

  it("salva campos simples como nome/value em vez de strings soltas", async () => {
    const state = sheet()
    state.openGeneralEditor("camposSimples")
    state.generalDraft = { nome: "Origem", value: "Arton" }
    await state.saveGeneralElement()
    const saved = JSON.parse(localStorage.getItem("grimorio_general_ficha_9"))
    expect(saved.camposSimples[0]).toMatchObject({ nome: "Origem", value: "Arton" })
    expect(client.post).not.toHaveBeenCalled()
    expect(client.put).not.toHaveBeenCalled()
  })

  it("não substitui registros remotos por cache antigo e mantém rascunhos locais", () => {
    const state = sheet()
    localStorage.setItem("grimorio_general_ficha_9", JSON.stringify({ pericias: [{ id: 2, nome: "Cache antigo" }, { nome: "Rascunho" }] }))
    const loaded = state.loadGeneralElements({ id: 9, pericias: [{ id: 2, nome: "Atual" }] })
    expect(loaded.pericias.map(item => item.nome)).toEqual(["Atual", "Rascunho"])
    expect(loaded.pericias[1]._generalLocal).toBe(true)
  })
})

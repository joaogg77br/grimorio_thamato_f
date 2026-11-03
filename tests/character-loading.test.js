import { beforeEach, describe, expect, it, vi } from "vitest"
import { getFichasByUser } from "../src/useApi/index.js"
import { createCharacter, deferred } from "./helpers/character.js"

vi.mock("../src/useApi/index.js")

describe("Carregamento de personagens", () => {
  beforeEach(() => vi.mocked(getFichasByUser).mockReset())

  it("compartilha uma busca em andamento e atualiza a lista uma única vez", async () => {
    const state = createCharacter()
    const request = deferred()
    vi.mocked(getFichasByUser).mockReturnValue(request.promise)
    const first = state.carregarFichas()
    const second = state.carregarFichas()
    expect(getFichasByUser).toHaveBeenCalledTimes(1)
    expect(state.loading).toBe(true)
    request.resolve({ data: { data: [{ id: 1, sistema: "geral" }] } })
    await Promise.all([first, second])
    expect(state.fichasApi).toEqual([{ id: 1, sistema: "geral" }])
    expect(state.loading).toBe(false)
    expect(state.fichasLoaded).toBe(true)
  })

  it("preserva cards quando atualizar falha e permite tentar novamente", async () => {
    const state = createCharacter()
    const cards = [{ id: 1, nomePersonagem: "Arin" }]
    vi.mocked(getFichasByUser).mockResolvedValueOnce({ data: { data: cards } })
    await state.carregarFichas()
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(getFichasByUser).mockRejectedValueOnce(new Error("offline"))
    await state.carregarFichas()
    expect(state.fichasApi).toEqual(cards)
    expect(state.fichasError).toContain("Não foi possível atualizar")
    expect(state.loading).toBe(false)
    vi.mocked(getFichasByUser).mockResolvedValueOnce({ data: { data: [] } })
    await state.carregarFichas()
    expect(state.fichasError).toBe("")
    expect(state.fichasApi).toEqual([])
  })

  it("ignora respostas de uma conta anterior sem encerrar o carregamento da atual", async () => {
    const state = createCharacter()
    const old = deferred(), current = deferred()
    vi.mocked(getFichasByUser).mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
    const first = state.carregarFichas()
    state.$store.auth.user = { id: "another-user" }
    const second = state.carregarFichas()
    old.resolve({ data: { data: [{ id: 1 }] } })
    await first
    expect(state.fichasApi).toEqual([])
    expect(state.loading).toBe(true)
    current.resolve({ data: { data: [{ id: 2 }] } })
    await second
    expect(state.fichasApi).toEqual([{ id: 2 }])
    expect(state.loading).toBe(false)
  })

  it("reutiliza a lista recente ao navegar e busca novamente quando ela expira", async () => {
    const state = createCharacter()
    vi.mocked(getFichasByUser).mockResolvedValue({ data: { data: [{ id: 1 }] } })
    await state.carregarFichas()
    await state.syncCharacterRoute()
    expect(getFichasByUser).toHaveBeenCalledTimes(1)
    state.fichasLastLoaded = Date.now() - 31000
    await state.syncCharacterRoute()
    expect(getFichasByUser).toHaveBeenCalledTimes(2)
  })
})

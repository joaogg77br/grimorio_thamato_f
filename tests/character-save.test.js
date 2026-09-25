import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { updateFicha } from "../src/useApi/index.js"
import { createCharacter, deferred } from "./helpers/character.js"

vi.mock("../src/useApi/index.js")

describe("Salvamento da ficha", () => {
  let state

  beforeEach(() => {
    vi.useFakeTimers()
    state = createCharacter()
    state.viewMode = "edit"
    state.selectedCharId = "ficha-teste"
    state.form.nome = "Arin"
    state.carregarFichas = vi.fn().mockResolvedValue()
    state.updatePericiasFicha = vi.fn().mockResolvedValue()
    vi.mocked(updateFicha).mockReset().mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it("salva somente depois de 1,5 segundo sem nova edicao", async () => {
    state.scheduleAutoSave()
    await vi.advanceTimersByTimeAsync(1000)
    expect(updateFicha).not.toHaveBeenCalled()
    state.form.nome = "Arin atualizado"
    state.scheduleAutoSave()
    await vi.advanceTimersByTimeAsync(1499)
    expect(updateFicha).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(updateFicha).toHaveBeenCalledTimes(1)
    expect(updateFicha).toHaveBeenCalledWith("ficha-teste", expect.objectContaining({ nomePersonagem: "Arin atualizado" }))
    expect(state.autoSaveState).toBe("salvo")
    expect(state.viewMode).toBe("edit")
  })

  it.each([
    { autoSaveSuspended: true },
    { leavingFicha: true },
    { viewMode: "list" },
    { selectedCharId: null },
  ])("nao agenda autosave quando o estado impede: %j", async overrides => {
    Object.assign(state, overrides)
    state.scheduleAutoSave()
    await vi.advanceTimersByTimeAsync(2000)
    expect(updateFicha).not.toHaveBeenCalled()
  })

  it("serializa autosaves e grava novamente os dados editados durante a requisicao", async () => {
    const first = deferred()
    vi.mocked(updateFicha).mockImplementationOnce(() => first.promise)
    const saving = state.performAutoSave()
    state.form.nome = "Nome novo"
    state.performAutoSave()
    expect(updateFicha).toHaveBeenCalledTimes(1)
    first.resolve({ data: {} })
    await saving
    await vi.advanceTimersByTimeAsync(1500)
    expect(updateFicha).toHaveBeenCalledTimes(2)
    expect(updateFicha).toHaveBeenLastCalledWith("ficha-teste", expect.objectContaining({ nomePersonagem: "Nome novo" }))
  })

  it("salva a edicao pendente antes de limpar a ficha ao sair", async () => {
    const request = deferred()
    vi.mocked(updateFicha).mockImplementationOnce(() => request.promise)
    state.form.nome = "Ultima edicao"
    state.scheduleAutoSave()
    const leaving = state.sairDaFicha()
    expect(updateFicha).toHaveBeenCalledWith("ficha-teste", expect.objectContaining({ nomePersonagem: "Ultima edicao" }))
    expect(state.leavingFicha).toBe(true)
    expect(state.viewMode).toBe("edit")
    expect(state.form.nome).toBe("Ultima edicao")
    request.resolve({ data: {} })
    await leaving
    expect(state.viewMode).toBe("list")
    expect(state.selectedCharId).toBeNull()
    expect(state.leavingFicha).toBe(false)
    await vi.advanceTimersByTimeAsync(3000)
    expect(updateFicha).toHaveBeenCalledTimes(1)
  })

  it("ignora cliques repetidos em sair durante o salvamento", async () => {
    const request = deferred()
    vi.mocked(updateFicha).mockImplementationOnce(() => request.promise)
    const leaving = state.sairDaFicha()
    await state.sairDaFicha()
    expect(updateFicha).toHaveBeenCalledTimes(1)
    request.resolve({ data: {} })
    await leaving
    expect(state.viewMode).toBe("list")
  })

  it("aguarda autosave em andamento antes de salvar a ultima edicao e sair", async () => {
    const first = deferred()
    const last = deferred()
    vi.mocked(updateFicha)
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => last.promise)
    const saving = state.performAutoSave()
    state.form.nome = "Edicao durante autosave"
    const leaving = state.sairDaFicha()
    expect(updateFicha).toHaveBeenCalledTimes(1)
    first.resolve({ data: {} })
    await saving
    await vi.advanceTimersByTimeAsync(0)
    expect(updateFicha).toHaveBeenCalledTimes(2)
    expect(updateFicha).toHaveBeenLastCalledWith("ficha-teste", expect.objectContaining({ nomePersonagem: "Edicao durante autosave" }))
    expect(state.viewMode).toBe("edit")
    last.resolve({ data: {} })
    await leaving
    expect(state.viewMode).toBe("list")
  })

  it("preserva a ficha quando a API falha e permite tentar sair novamente", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(updateFicha).mockRejectedValueOnce(new Error("Falha simulada"))
    await state.sairDaFicha()
    expect(state.viewMode).toBe("edit")
    expect(state.selectedCharId).toBe("ficha-teste")
    expect(state.form.nome).toBe("Arin")
    expect(state.autoSaveState).toBe("erro")
    expect(state.leavingFicha).toBe(false)
    expect(state.$store.toasts.push).toHaveBeenCalledWith(expect.any(String), "error")
    await state.sairDaFicha()
    expect(state.viewMode).toBe("list")
  })

  it("nao sai quando a atualizacao das pericias falha", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    state.updatePericiasFicha.mockRejectedValueOnce(new Error("Falha nas pericias"))
    await state.sairDaFicha()
    expect(state.viewMode).toBe("edit")
    expect(state.form.nome).toBe("Arin")
    expect(state.autoSaveState).toBe("erro")
  })
})

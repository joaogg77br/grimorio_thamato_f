import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createConfirmationStore, createToastStore } from "../src/lib/notifications.js"
import client from "../src/useApi/client.js"
import { createCharacter } from "./helpers/character.js"
import campaign from "../src/components/campaign/campaign.js"
import master from "../src/components/master/master.js"

vi.mock("../src/useApi/client.js", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }))

describe("Confirmações", () => {
  beforeEach(() => vi.resetAllMocks())

  it("aguarda a escolha do usuário e cancela solicitações repetidas", async () => {
    const store = createConfirmationStore()
    const response = vi.fn()
    const pending = store.request({ title: "Excluir?", message: "Esta ação é permanente.", confirmLabel: "Excluir" }).then(response)
    expect(store.open).toBe(true)
    expect(response).not.toHaveBeenCalled()
    expect(await store.request({ title: "Outra ação?" })).toBe(false)
    expect(store.title).toBe("Excluir?")
    store.settle(true)
    store.settle(false)
    await pending
    expect(response).toHaveBeenCalledExactlyOnceWith(true)
    expect(store.open).toBe(false)
    const next = store.request({ title: "Limpar?" })
    store.settle(false)
    expect(await next).toBe(false)
  })

  it("exclui uma ficha apenas depois da confirmação e preserva ao cancelar", async () => {
    const state = createCharacter()
    state.$store.confirmation = createConfirmationStore()
    state.carregarFichas = vi.fn()
    client.delete.mockResolvedValue({ data: {} })
    const ficha = { id: 7, nomePersonagem: "Arin" }
    const cancelled = state.deleteFichaCard(ficha)
    expect(client.delete).not.toHaveBeenCalled()
    expect(state.$store.confirmation.message).toContain("Arin")
    state.$store.confirmation.settle(false)
    await cancelled
    expect(client.delete).not.toHaveBeenCalled()
    const confirmed = state.deleteFichaCard(ficha)
    state.$store.confirmation.settle(true)
    await confirmed
    expect(client.delete).toHaveBeenCalledExactlyOnceWith("/deleteFicha/7/tormenta")
    expect(state.$store.toasts.push).toHaveBeenCalledWith("Ficha excluída.", "success")
  })

  it("não executa a exclusão de outra sessão após a espera", async () => {
    const state = createCharacter()
    state.$store.confirmation = createConfirmationStore()
    const pending = state.deleteFichaCard({ id: 7 })
    state.$store.auth.user = { id: "outra-conta" }
    state.$store.confirmation.settle(true)
    await pending
    expect(client.delete).not.toHaveBeenCalled()
  })

  it("preserva os campos ao cancelar e não restaura uma ficha aberta depois da pergunta", async () => {
    const state = createCharacter()
    state.$store.confirmation = createConfirmationStore()
    state.form.nome = "Arin"
    const cancelled = state.resetForm()
    state.$store.confirmation.settle(false)
    await cancelled
    expect(state.form.nome).toBe("Arin")
    const pending = state.resetForm()
    state.form = { ...state.form, nome: "Outra ficha" }
    state.$store.confirmation.settle(true)
    await pending
    expect(state.form.nome).toBe("Outra ficha")
  })

  it("não limpa o histórico de outra ficha após a pergunta", async () => {
    const state = createCharacter()
    state.$store.confirmation = createConfirmationStore()
    state.selectedCharId = 7
    state.historicoCarregado = [{ id: 1 }]
    const pending = state.limparHistoricoFicha()
    state.selectedCharId = 8
    state.$store.confirmation.settle(true)
    await pending
    expect(client.delete).not.toHaveBeenCalled()
  })

  it.each(["sair", "excluir"])("aguarda confirmação para %s a campanha", async action => {
    const state = (action === "sair" ? campaign : master).data()
    const confirmation = createConfirmationStore()
    state.$store = { auth: { user: { id: 1 } }, confirmation, toasts: { push: vi.fn() } }
    state.myCampaigns = [{ id: 10, nomeCampanha: "A jornada" }]
    state.selectedCampaignId = 10
    state.loadCampaigns = vi.fn()
    client.delete.mockResolvedValue({ data: {} })
    const execute = () => action === "sair" ? state.leaveCampaign(state.myCampaigns[0]) : state.removeCampaign()
    const cancelled = execute()
    expect(confirmation.message).toContain("A jornada")
    confirmation.settle(false)
    await cancelled
    expect(client.delete).not.toHaveBeenCalled()
    const confirmed = execute()
    expect(client.delete).not.toHaveBeenCalled()
    confirmation.settle(true)
    await confirmed
    expect(client.delete).toHaveBeenCalledTimes(1)
    expect(state.$store.toasts.push).toHaveBeenCalledWith(expect.any(String), "success")
  })
})

describe("Toasts", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("fecha automaticamente após 3,4 segundos e a animação de saída", () => {
    const store = createToastStore()
    store.push("Salvo", "success")
    vi.advanceTimersByTime(3399)
    expect(store.items[0].leaving).toBe(false)
    vi.advanceTimersByTime(1)
    expect(store.items[0].leaving).toBe(true)
    vi.advanceTimersByTime(280)
    expect(store.items).toEqual([])
  })

  it("pausa a contagem e retoma apenas o tempo que restava", () => {
    const store = createToastStore(), id = store.push("Uma mensagem longa", "info")
    vi.advanceTimersByTime(1000)
    store.pause(id)
    store.pause(id)
    vi.advanceTimersByTime(10000)
    expect(store.items[0].leaving).toBe(false)
    store.resume(id)
    store.resume(id)
    vi.advanceTimersByTime(2399)
    expect(store.items[0].leaving).toBe(false)
    vi.advanceTimersByTime(1)
    expect(store.items[0].leaving).toBe(true)
  })

  it("permite fechar antes do prazo sem interferir nas outras notificações", () => {
    const store = createToastStore()
    const first = store.push("Primeira", "error")
    const second = store.push("Segunda", "info")
    store.pause(first)
    store.dismiss(first)
    store.dismiss(first)
    store.resume(first)
    vi.advanceTimersByTime(280)
    expect(store.items.map(item => item.id)).toEqual([second])
    vi.advanceTimersByTime(3400)
    expect(store.items).toEqual([])
  })
})

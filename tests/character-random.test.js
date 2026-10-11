import { beforeEach, describe, expect, it, vi } from "vitest"
import { createFicha } from "../src/useApi/index.js"
import RACAS_DATA, { limparEmojiRaca } from "../src/data/racas.js"
import { valoresIniciais } from "../src/data/valores-iniciais.js"
import { createCharacter, deferred } from "./helpers/character.js"

vi.mock("../src/useApi/index.js")

describe("Personagem aleatorio", () => {
  let state

  beforeEach(() => {
    state = createCharacter()
    state.carregarFichas = vi.fn(async () => {
      state.fichasApi = [{ id: "nova-ficha" }]
    })
    state.abrirFicha = vi.fn()
    state.adicionarHabilidadesDeRaca = vi.fn().mockResolvedValue()
    vi.mocked(createFicha).mockReset().mockResolvedValue({ data: { ficha: { id: "nova-ficha" } } })
  })

  it.each(RACAS_DATA)("gera atributos validos e escolhas raciais para $nome", async raca => {
    vi.spyOn(state, "wizardRacas", "get").mockReturnValue([raca])
    vi.spyOn(state, "wizardFinalizar").mockResolvedValue()
    for (let tentativa = 0; tentativa < 30; tentativa++) {
      await state.criarPersonagemAleatorio()
      expect(state.wizardPontosRestantes).toBe(0)
      expect(state.wizardRacialEscolhaCompleta).toBe(true)
      expect(new Set(state.wizardRacialChoices).size).toBe(state.wizardRacialChoicesCount)
      expect(state.wizardStepReached(3)).toBe(true)
      expect(state.wizardPodeProximo).toBe(true)
      expect(state.CLASSES).toContain(state.wizardClasse)
      expect(state.ORIGENS).toContain(state.wizardOrigem)
      expect(state.DIVINDADES).toContain(state.wizardDivindade)
      for (const valor of Object.values(state.wizardAtributos)) {
        expect(Number.isInteger(valor)).toBe(true)
        expect(valor).toBeGreaterThanOrEqual(8)
        expect(valor).toBeLessThanOrEqual(18)
      }
    }
    expect(createFicha).not.toHaveBeenCalled()
  })

  it.each([0, 0.999999])("conclui a distribuicao mesmo com sorteio constante %s", async valor => {
    vi.spyOn(Math, "random").mockReturnValue(valor)
    await state.criarPersonagemAleatorio()
    expect(state.wizardPontosRestantes).toBe(0)
    expect(createFicha).toHaveBeenCalledTimes(1)
  })

  it("salva no nivel 1 com bonus raciais, PV, PM e jogador e abre a ficha criada", async () => {
    await state.criarPersonagemAleatorio()
    const atributos = Object.fromEntries(state.ATRIBUTOS_LIST.map(key => [key, state.wizardValorFinal(key)]))
    const { pv, pm } = valoresIniciais(state.wizardClasse, atributos)
    expect(createFicha).toHaveBeenCalledWith(expect.objectContaining({
      nomePersonagem: state.wizardNome,
      nomeJogador: "Jogador",
      jogadorId: "test-user",
      nivel: 1,
      raca: limparEmojiRaca(state.wizardRaca.nome),
      classe: state.wizardClasse,
      origem: state.wizardOrigem,
      divindade: state.wizardDivindade,
      for_: atributos.FOR, des: atributos.DES, con: atributos.CON,
      int_: atributos.INT, sab: atributos.SAB, car: atributos.CAR,
      pvMax: pv, pvCurrent: pv, pmMax: pm, pmCurrent: pm,
      tamanho: state.wizardRaca.tamanho,
      deslocamento: state.extrairDeslocamento(state.wizardRaca),
    }))
    expect(state.adicionarHabilidadesDeRaca).toHaveBeenCalledWith("nova-ficha", state.wizardRaca.nome)
    expect(state.abrirFicha).toHaveBeenCalledWith({ id: "nova-ficha" })
    expect(state.wizardOpen).toBe(false)
    expect(state.creatingFicha).toBe(false)
  })

  it("bloqueia criacoes duplicadas durante o salvamento", async () => {
    const request = deferred()
    vi.mocked(createFicha).mockReturnValueOnce(request.promise)
    const saving = state.criarPersonagemAleatorio()
    const nome = state.wizardNome
    await state.criarPersonagemAleatorio()
    await state.wizardFinalizar()
    expect(state.wizardNome).toBe(nome)
    expect(createFicha).toHaveBeenCalledTimes(1)
    request.resolve({ data: { ficha: { id: "nova-ficha" } } })
    await saving
    expect(state.creatingFicha).toBe(false)
  })

  it("informa falha e permite tentar criar novamente", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.mocked(createFicha).mockRejectedValueOnce(new Error("Falha de rede"))
    await state.criarPersonagemAleatorio()
    expect(state.creatingFicha).toBe(false)
    expect(state.abrirFicha).not.toHaveBeenCalled()
    expect(state.$store.toasts.push).toHaveBeenCalledWith(expect.any(String), "error")
    await state.criarPersonagemAleatorio()
    expect(state.abrirFicha).toHaveBeenCalledOnce()
  })

  it("preserva uma ficha aberta e suas edicoes", async () => {
    state.selectedCharId = "ficha-existente"
    state.form.nome = "Personagem editado"
    await state.criarPersonagemAleatorio()
    expect(state.form.nome).toBe("Personagem editado")
    expect(createFicha).not.toHaveBeenCalled()
  })

  it("nao cria sem usuario autenticado", async () => {
    state.$store.auth.user = null
    await state.criarPersonagemAleatorio()
    expect(createFicha).not.toHaveBeenCalled()
    expect(state.wizardOpen).toBe(false)
  })
})

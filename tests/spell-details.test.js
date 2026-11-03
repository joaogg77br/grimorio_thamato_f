import { describe, expect, it, vi } from "vitest"
import magias from "../magias-tormenta20.json"
import { detalhesMagia, serializarDescricaoMagia } from "../src/lib/spellDetails.js"
import { createMagia } from "../src/useApi/index.js"
import { createCharacter } from "./helpers/character.js"

vi.mock("../src/useApi/index.js")

const magia = nome => magias.find(item => item.nome === nome)

describe("Aprimoramentos e truques das magias", () => {
  it("cobre os 507 aprimoramentos e 16 truques identificados no PDF", () => {
    expect(magias.reduce((total, item) => total + item.aprimoramentos.length, 0)).toBe(507)
    expect(magias.reduce((total, item) => total + item.truques.length, 0)).toBe(16)
    for (const item of magias) {
      expect(item.descricaoBase).not.toMatch(/(?:Truque|\+\d+ PM)(?:\s*\([^)]*\))?:/u)
      const opcoes = [...item.aprimoramentos, ...item.truques]
      expect(new Set(opcoes.map(opcao => opcao.ordem)).size).toBe(opcoes.length)
      for (const opcao of opcoes) {
        expect(opcao.descricao).toBeTruthy()
        expect(opcao.fonte.paginaPdf).toBeGreaterThanOrEqual(item.fonte.paginaPdf)
      }
    }
  })

  it("preserva as quatro opções de Luz restritas a arcanos e divinos, incluindo +0 PM", () => {
    const opcoes = magia("Luz").aprimoramentos
    expect(opcoes).toHaveLength(7)
    expect(opcoes.filter(opcao => opcao.restricao === "Apenas Arcanos").map(opcao => opcao.custoAdicional)).toEqual([0, 2])
    expect(opcoes.filter(opcao => opcao.restricao === "Apenas Divinos").map(opcao => opcao.custoAdicional)).toEqual([2, 5])
    expect(opcoes[2].descricao).not.toContain("Apenas Arcanos")
    expect(magia("Controlar o Clima").aprimoramentos[0]).toMatchObject({ custoAdicional: 1, restricao: "Apenas Druidas" })
  })

  it("mantém dois truques de Curar Ferimentos e custos repetidos como opções distintas", () => {
    const curar = detalhesMagia(magia("Curar Ferimentos"))
    expect(curar.truques).toHaveLength(2)
    expect(curar.truques[0].descricao).toContain("estabiliza")
    expect(curar.truques[1].descricao).toContain("morto-vivo")
    expect(magia("Adaga Mental").aprimoramentos.filter(opcao => opcao.custoAdicional === 2)).toHaveLength(2)
  })

  it("exibe requisitos de círculo separados sem apagar outros efeitos do texto", () => {
    const opcao = detalhesMagia(magia("Criar Ilusão")).aprimoramentos.at(-1)
    expect(opcao.circuloMinimo).toBe(3)
    expect(opcao.requisitos).toEqual(["Requer 3º círculo."])
    expect(opcao.efeito).toContain("modificar livremente a ilusão")
    expect(opcao.efeito).not.toContain("Requer 3º círculo")
    expect(opcao.descricao).toContain("Requer 3º círculo.")
  })

  it("recupera todas as opções após salvar apenas os campos suportados pela API", () => {
    for (const item of magias) {
      const persistida = { descricao: serializarDescricaoMagia(item), truque: item.truque }
      const recuperada = detalhesMagia(persistida)
      const esperada = detalhesMagia(item)
      expect(recuperada.descricaoBase, item.nome).toBe(esperada.descricaoBase)
      for (const campo of ["aprimoramentos", "truques"]) {
        expect(recuperada[campo].map(({ descricao, custoAdicional, restricao, requisitos }) => ({ descricao, custoAdicional, restricao, requisitos })), item.nome)
          .toEqual(esperada[campo].map(({ descricao, custoAdicional, restricao, requisitos }) => ({ descricao, custoAdicional, restricao, requisitos })))
      }
    }
  })

  it("respeita magias personalizadas e truques antigos sem buscar opções pelo nome", () => {
    const personalizada = detalhesMagia({ nome: "Luz", descricao: "Minha luz só ilumina um passo.", truque: "Acende uma vela." })
    expect(personalizada.aprimoramentos).toEqual([])
    expect(personalizada.descricaoBase).toBe("Minha luz só ilumina um passo.")
    expect(personalizada.truques[0].descricao).toBe("Acende uma vela.")
    expect(detalhesMagia().aprimoramentos).toEqual([])
  })

  it("envia a descrição completa ao adicionar uma magia estruturada à ficha", async () => {
    const state = createCharacter()
    state.selectedCharId = 42
    state.loadMagiasFicha = vi.fn().mockResolvedValue()
    vi.mocked(createMagia).mockResolvedValue({ data: {} })
    const item = { ...magia("Luz"), descricao: magia("Luz").descricaoBase }
    await state.addMagiaToFicha(item)
    expect(createMagia).toHaveBeenCalledWith(expect.objectContaining({ fichaId: 42, descricao: expect.stringContaining("+0 PM (Apenas Arcanos):") }))
    expect(detalhesMagia(vi.mocked(createMagia).mock.calls.at(-1)[0]).aprimoramentos).toHaveLength(7)
  })
})

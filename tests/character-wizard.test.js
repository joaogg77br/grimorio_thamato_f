import { beforeEach, describe, expect, it, vi } from "vitest"
import { createCharacter } from "./helpers/character.js"

vi.mock("../src/useApi/index.js")

describe("Wizard de personagem", () => {
  let state

  beforeEach(() => {
    state = createCharacter()
  })

  it("inicia com seis atributos em 10 e 20 pontos disponiveis", () => {
    expect(Object.values(state.wizardAtributos)).toEqual([10, 10, 10, 10, 10, 10])
    expect(state.wizardPontosRestantes).toBe(20)
  })

  it("cobra a diferenca de custo ao aumentar e devolve ao diminuir", () => {
    state.wizardAtribuir("FOR", 14)
    expect(state.wizardPontosRestantes).toBe(16)
    state.wizardInc("FOR")
    expect(state.wizardAtributos.FOR).toBe(15)
    expect(state.wizardPontosRestantes).toBe(14)
    state.wizardDec("FOR")
    expect(state.wizardPontosRestantes).toBe(16)
  })

  it("bloqueia aumento por toque e entrada direta acima do orcamento", () => {
    state.wizardAtribuir("FOR", 18)
    state.wizardAtribuir("DES", 15)
    expect(state.wizardPontosRestantes).toBe(0)
    expect(state.wizardPodeAumentar("CON")).toBe(false)
    state.wizardInc("CON")
    state.wizardAtribuir("CON", 18)
    expect(state.wizardAtributos.CON).toBe(10)
    expect(state.wizardPontosRestantes).toBe(0)
  })

  it("libera a compra depois de devolver pontos", () => {
    state.wizardAtribuir("FOR", 18)
    state.wizardAtribuir("DES", 15)
    state.wizardDec("DES")
    expect(state.wizardPodeAumentar("CON")).toBe(true)
    state.wizardInc("CON")
    expect(state.wizardPontosRestantes).toBe(1)
  })

  it("respeita os limites de 8 e 18", () => {
    state.wizardAtribuir("FOR", 100)
    state.wizardInc("FOR")
    expect(state.wizardAtributos.FOR).toBe(18)
    expect(state.wizardPodeAumentar("FOR")).toBe(false)
    state.wizardAtribuir("DES", -20)
    state.wizardDec("DES")
    expect(state.wizardAtributos.DES).toBe(8)
  })

  it.each([10.5, "abc", NaN, Infinity])("ignora entrada invalida: %s", value => {
    state.wizardAtribuir("FOR", value)
    expect(state.wizardAtributos.FOR).toBe(10)
    expect(state.wizardPontosRestantes).toBe(20)
  })

  it("aceita o valor inteiro recebido de um input", () => {
    state.wizardAtribuir("FOR", "14")
    expect(state.wizardAtributos.FOR).toBe(14)
    expect(state.wizardPontosRestantes).toBe(16)
  })

  it("aplica bonus raciais sem consumir pontos e limita tres escolhas", () => {
    state.wizardRaca = { atributos: { descricao_atributos: "3 Atributos" } }
    for (const key of ["FOR", "DES", "CON", "INT"]) state.alternarRacialEscolha(key)
    expect(state.wizardRacialChoices).toEqual(["FOR", "DES", "CON"])
    expect(state.wizardValorFinal("FOR")).toBe(12)
    expect(state.wizardValorFinal("INT")).toBe(10)
    expect(state.wizardPontosRestantes).toBe(20)
    state.alternarRacialEscolha("FOR")
    expect(state.wizardValorFinal("FOR")).toBe(10)
    expect(state.wizardRacialEscolhaCompleta).toBe(false)
  })

  it("permite entrar nos atributos antes de escolher os bonus raciais", () => {
    state.wizardGoTo(2)
    expect(state.wizardStep).toBe(1)
    state.wizardRaca = { atributos: { descricao_atributos: "3 Atributos" } }
    state.wizardGoTo(2)
    expect(state.wizardStep).toBe(2)
  })

  it("exige gastar os 20 pontos e completar as escolhas antes da identidade", () => {
    state.wizardRaca = { atributos: { descricao_atributos: "3 Atributos" } }
    state.wizardStep = 2
    state.wizardNext()
    expect(state.wizardStep).toBe(2)
    state.wizardAtribuir("FOR", 18)
    state.wizardAtribuir("DES", 15)
    state.wizardGoTo(3)
    expect(state.wizardStep).toBe(2)
    for (const key of ["FOR", "DES", "CON"]) state.alternarRacialEscolha(key)
    state.wizardNext()
    expect(state.wizardStep).toBe(3)
  })

  it("exige nome nao vazio e classe para finalizar", () => {
    state.wizardStep = 3
    state.wizardNome = "   "
    state.wizardClasse = "Guerreiro"
    expect(state.wizardPodeProximo).toBe(false)
    state.wizardNome = "Arin"
    expect(state.wizardPodeProximo).toBe(true)
    state.wizardClasse = ""
    expect(state.wizardPodeProximo).toBe(false)
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import dice, { clampAdvantageCount, multiplyDiceFormula, parseDiceFormula } from "../src/components/dice/dice.js"

vi.mock("../src/useApi/index.js", () => ({
  createHistorico: vi.fn().mockResolvedValue({ data: {} }),
}))

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
  })),
}))

function createDice() {
  const state = dice.data()
  state.$store = {
    sound: { enabled: false },
    critAnim: { enabled: true },
  }
  return state
}

function mockRolls(values) {
  const randoms = [...values]
  return vi.spyOn(Math, "random").mockImplementation(() => {
    if (!randoms.length) return 0
    return randoms.shift()
  })
}

describe("Rolagem de dados", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    globalThis.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    }
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    delete globalThis.localStorage
  })

  it("rejeita formulas vazias, parciais ou com operadores sobrando", () => {
    for (const formula of ["", "abc", "2d6foo", "1d20+", "2dd6", "0d6", "1d1", "101d6"]) {
      expect(() => parseDiceFormula(formula)).toThrow()
    }
  })

  it("interpreta formulas validas com espacos, modificadores e dados negativos", () => {
    expect(parseDiceFormula(" 2D6 + 3 - d4 ").parts).toEqual([
      { type: "dice", count: 2, sides: 6, sign: 1 },
      { type: "mod", value: 3 },
      { type: "dice", count: 1, sides: 4, sign: -1 },
    ])
  })

  it("multiplica apenas quantidades de dados no critico", () => {
    expect(multiplyDiceFormula("1d8+1d4+3", 3)).toBe("3d8+3d4+3")
    expect(multiplyDiceFormula("1d8-1d4+2", 2)).toBe("2d8-2d4+2")
  })

  it("nao deixa vantagem/desvantagem usar contagens invalidas", () => {
    expect(clampAdvantageCount("")).toBe(2)
    expect(clampAdvantageCount(1)).toBe(2)
    expect(clampAdvantageCount(99)).toBe(10)
    expect(clampAdvantageCount(3.8)).toBe(3)
  })

  it("mostra erro e nao registra rolagem quando a formula e invalida", () => {
    const state = createDice()
    state.executeRoll("2d6foo", "Inválida")
    expect(state.lastResult).toBe("Erro")
    expect(state.lastDetail).toBe("Fórmula inválida")
    expect(state.lastRollData).toBeNull()
    expect(state.history).toEqual([])
    expect(state.miniToasts).toEqual([])
  })

  it("serializa corretamente formulas com varios grupos de dados no historico", () => {
    const state = createDice()
    state.suppressToasts = true
    mockRolls([0, 0.5])
    state.executeRoll("1d8+1d4+3", "Dano")
    expect(state.lastResult).toBe(7)
    expect(state.montarRollString(state.lastRollData)).toBe("1d8+1d4+3 = 7")
  })

  it("espera o popup de 20 natural terminar antes de mostrar o toast", async () => {
    const state = createDice()
    mockRolls([0.99])
    state.executeRoll("1d20+5", "Teste")
    expect(state.d20Popup.show).toBe(true)
    expect(state.miniToasts).toEqual([])
    await vi.advanceTimersByTimeAsync(4899)
    expect(state.miniToasts).toEqual([])
    await vi.advanceTimersByTimeAsync(1)
    expect(state.d20Popup.show).toBe(false)
    expect(state.miniToasts).toHaveLength(1)
    expect(state.miniToasts[0]).toMatchObject({ label: "Teste", result: 25, isCrit: true })
  })

  it("nao abre popup nem atrasa toast quando crita apenas pela margem de ameaca", () => {
    const state = createDice()
    mockRolls([0.89])
    state.executeRoll("1d20+5", "Ataque")
    expect(state.lastRollData.chosenD20).toBe(18)
    expect(state.d20Popup.show).toBe(false)
    expect(state.miniToasts).toHaveLength(1)
    state.pushAtaqueToast(
      "Espada",
      "Luta",
      { total: 23, detail: "[18] +5" },
      { total: 12, detail: "[7, 5]", baseTotal: 12, isCrit: true, isNatural20: false, isCritFail: false, multiplier: 2 }
    )
    expect(state.miniToasts).toHaveLength(1)
    expect(state.miniToasts[0]).toMatchObject({ variant: "ataque", weaponName: "Espada", isCrit: true })
  })
})

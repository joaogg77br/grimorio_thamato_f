import { describe, expect, it, vi } from "vitest"
import { createCharacter } from "./helpers/character.js"

vi.mock("../src/useApi/index.js")

describe("Navegacao das secoes", () => {
  it.each(["pericias", "inventario", "magias", "habilidades", "descricao", "ataques", "historico"])("abre %s e fecha popups e menu", section => {
    const state = createCharacter()
    state.sectionMenuOpen = true
    state.showEquipPopup = true
    state.showMagiasPopup = true
    state.showHabilidadesPopup = true
    state.showCriarPopup = true
    state.editArmaMode = true
    state.editArmaId = "arma-teste"
    state.openFichaSection(section)
    expect(state.activeTab).toBe(section)
    expect(state.sectionOpen).toBe(true)
    expect(state.sectionMenuOpen).toBe(false)
    expect(state.showEquipPopup).toBe(false)
    expect(state.showMagiasPopup).toBe(false)
    expect(state.showHabilidadesPopup).toBe(false)
    expect(state.showCriarPopup).toBe(false)
    expect(state.editArmaMode).toBe(false)
    expect(state.editArmaId).toBeNull()
  })

  it("fecha a secao sem apagar os dados da ficha", () => {
    const state = createCharacter()
    state.form.nome = "Arin"
    state.sectionOpen = true
    state.sectionMenuOpen = true
    state.closeFichaSection()
    expect(state.sectionOpen).toBe(false)
    expect(state.sectionMenuOpen).toBe(false)
    expect(state.form.nome).toBe("Arin")
  })
})

import { describe, expect, it, vi } from "vitest"
import { createCharacter } from "./helpers/character.js"
import { fichaPath } from "../src/lib/routes.js"
import master from "../src/components/master/master.js"

vi.mock("../src/useApi/index.js")

describe("Navegacao das secoes", () => {
  it("inclui a campanha sem alterar links de fichas independentes", () => {
    expect(fichaPath("pericias", 101)).toBe("/personagens/ficha/pericias?id=101")
    expect(fichaPath("inventario", 101, "geral", "campanha/30")).toBe("/personagens/ficha/inventario?id=101&sistema=geral&campanhaId=campanha%2F30")
  })

  it("abre a ficha com a campanha vinculada e preserva ao trocar de secao", async () => {
    const state = createCharacter()
    state.loadGeneralRemoteElements = vi.fn().mockResolvedValue()
    await state.abrirFicha({ id: 101, sistema: "geral", campanhaId: 30 })
    expect(state.$router.resolve()).toBe("/personagens/ficha/pericias?id=101&sistema=geral&campanhaId=30")
    state.openFichaSection("inventario")
    expect(state.$router.resolve()).toBe("/personagens/ficha/inventario?id=101&sistema=geral&campanhaId=30")
    state.voltarParaLista()
    await state.abrirFicha({ id: 102, sistema: "geral" })
    expect(state.$router.resolve()).toBe("/personagens/ficha/pericias?id=102&sistema=geral")
  })

  it("restaura a campanha da URL ao carregar uma ficha", async () => {
    const state = createCharacter()
    state.fichasLoaded = true
    state.fichasApi = [{ id: 101, campanhaId: 20 }]
    state.abrirFicha = vi.fn().mockResolvedValue()
    state.$router.push("/personagens/ficha/pericias?id=101&campanhaId=30")
    await state.syncCharacterRoute()
    expect(state.abrirFicha).toHaveBeenCalledWith(state.fichasApi[0], { updateRoute: false, campanhaId: "30" })
  })

  it("acompanha mudancas na campanha da URL para uma ficha ja aberta", async () => {
    const state = createCharacter()
    state.selectedCharId = 101
    state.currentFichaCampaignId = 20
    state.$router.push("/personagens/ficha/pericias?id=101&campanhaId=30")
    await state.syncCharacterRoute()
    state.openFichaSection("inventario")
    expect(state.$router.query.campanhaId).toBe("30")
    state.$router.push("/personagens/ficha/pericias?id=101")
    await state.syncCharacterRoute()
    state.openFichaSection("inventario")
    expect(state.$router.query.campanhaId).toBeUndefined()
  })

  it("envia a campanha selecionada ao abrir uma ficha pelo mestre", () => {
    const state = master.data()
    state.selectedCampaignId = 30
    state.$store = { masterView: { ficha: null }, toasts: { push: vi.fn() } }
    const ficha = { id: 101, nomePersonagem: "Arin" }
    state.editFicha(ficha)
    expect(state.$store.masterView.ficha).toEqual({ ...ficha, campanhaId: 30 })
    expect(ficha).not.toHaveProperty("campanhaId")
  })

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

  it("nao considera uma ficha aberta sem id selecionado", () => {
    const state = createCharacter()
    state.viewMode = "edit"
    state.selectedCharId = null
    expect(state.hasOpenFicha).toBe(false)
    state.selectedCharId = "ficha-teste"
    expect(state.hasOpenFicha).toBe(true)
  })

  it("so exibe a ficha quando a rota ativa e de ficha", () => {
    const state = createCharacter()
    state.viewMode = "edit"
    state.selectedCharId = "ficha-teste"
    state.$router.push("/personagens")
    expect(state.shouldShowFicha).toBe(false)
    state.$router.push("/personagens/ficha/pericias?id=ficha-teste")
    expect(state.shouldShowFicha).toBe(true)
  })
})

import { localDB, generateId } from "../../lib/localDB.js"
import { generalApi } from "../../useApi/generalApi.js"
import { getFichasByUser, createFicha, updateFicha, deleteFicha, createArma, getArmasByFicha, deleteArma, updateArma, createProtecao, getProtecoesByFicha, deleteProtecao, updateProtecaoEquipada, updateProtecao, createEquipamento, getEquipamentosByFicha, deleteEquipamento, updateEquipamento, createMagia, getMagiasByFicha, deleteMagia, updateMagia, createHabilidade, getHabilidadesByFicha, deleteHabilidade, updateHabilidade, getPericiasByFicha, updatePericia, getHistoricoByFicha, deleteHistorico } from "../../useApi/index.js"
import html from "./character.html?raw"
import { FICHA_PATHS, fichaPath, fichaSection } from "../../lib/routes.js"
import ARMAS_DATA from "../../data/armas.js"
import PROTECOES_DATA from "../../data/protecoes.js"
import EQUIPAMENTOS_DATA from "../../data/equipamentos.js"
import MAGIAS_DATA from "../../data/magias.js"
import HABILIDADES_DATA from "../../data/habilidades.js"
import EVOLUCAO_CLASSES from "../../data/evolucao.js"
import ORIGENS_DATA from "../../../origens-tormenta20.json"
import DEUSES_DATA from "../../../deuses-tormenta20.json"
import RACAS_DATA, { limparEmojiRaca, adicionarEmojiRaca } from "../../data/racas.js"
import { limparEmojiClasse } from "../../data/classes.js"
import { valoresIniciais } from "../../data/valores-iniciais.js"
import { detalhesMagia, serializarDescricaoMagia } from "../../lib/spellDetails.js"

const CLASSES = EVOLUCAO_CLASSES.map(classe => classe.classe)

const ORIGENS = ORIGENS_DATA.map(origem => origem.nome)

const RACAS = RACAS_DATA.map(r => limparEmojiRaca(r.nome))

const racaDataPorNome = (nome) => RACAS_DATA.find(r => limparEmojiRaca(r.nome).toLowerCase() === limparEmojiRaca(nome).toLowerCase())

const DIVINDADES = DEUSES_DATA.map(divindade => divindade.nome)

const ATRIBUTOS = ["FOR", "DES", "CON", "INT", "SAB", "CAR"]

const NOMES_ALEATORIOS = [
  "Arin", "Ayra", "Borin", "Dara", "Doran", "Elara", "Gorath", "Kael",
  "Lira", "Mira", "Nerian", "Ravi", "Selene", "Tarek", "Thalia", "Valen",
]

const SOBRENOMES_ALEATORIOS = [
  "Aurora", "Brumavale", "Caminhante", "Cinzas", "Estrela", "Ferro",
  "Folha Verde", "Lua Nova", "Pedra Alta", "Rios", "Tempestade", "Ventobravo",
]

const ATRIBUTOS_WIZARD = [
  { key: "FOR", nome: "Força", racaKey: "Força" },
  { key: "DES", nome: "Destreza", racaKey: "Destreza" },
  { key: "CON", nome: "Constituição", racaKey: "Constituição" },
  { key: "INT", nome: "Inteligência", racaKey: "Inteligência" },
  { key: "SAB", nome: "Sabedoria", racaKey: "Sabedoria" },
  { key: "CAR", nome: "Carisma", racaKey: "Carisma" },
]

const CUSTO_ATRIBUTO = { 8: -2, 9: -1, 10: 0, 11: 1, 12: 2, 13: 3, 14: 4, 15: 6, 16: 8, 17: 11, 18: 14 }
const PONTOS_CUSTO_ATRIBUTO = 20
const MIN_ATRIBUTO = 8
const MAX_ATRIBUTO = 18
const VALORES_ATRIBUTO = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

const PERICIAS_DEF = [
  { key: "acrobacia", nome: "Acrobacia", attr: "DES", penalidade: true, treinado: false },
  { key: "adestramento", nome: "Adestramento", attr: "CAR", penalidade: false, treinado: true },
  { key: "atletismo", nome: "Atletismo", attr: "FOR", penalidade: false, treinado: false },
  { key: "atuacao", nome: "Atuação", attr: "CAR", penalidade: false, treinado: false },
  { key: "cavalgar", nome: "Cavalgar", attr: "DES", penalidade: false, treinado: false },
  { key: "conhecimento", nome: "Conhecimento", attr: "INT", penalidade: false, treinado: true },
  { key: "cura", nome: "Cura", attr: "SAB", penalidade: false, treinado: false },
  { key: "diplomacia", nome: "Diplomacia", attr: "CAR", penalidade: false, treinado: false },
  { key: "enganacao", nome: "Enganação", attr: "CAR", penalidade: false, treinado: false },
  { key: "fortitude", nome: "Fortitude", attr: "CON", penalidade: false, treinado: false },
  { key: "furtividade", nome: "Furtividade", attr: "DES", penalidade: true, treinado: false },
  { key: "guerra", nome: "Guerra", attr: "INT", penalidade: false, treinado: true },
  { key: "iniciativa", nome: "Iniciativa", attr: "DES", penalidade: false, treinado: false },
  { key: "intimidacao", nome: "Intimidação", attr: "CAR", penalidade: false, treinado: false },
  { key: "intuicao", nome: "Intuição", attr: "SAB", penalidade: false, treinado: false },
  { key: "investigacao", nome: "Investigação", attr: "INT", penalidade: false, treinado: false },
  { key: "jogatina", nome: "Jogatina", attr: "CAR", penalidade: false, treinado: true },
  { key: "ladinagem", nome: "Ladinagem", attr: "DES", penalidade: true, treinado: true },
  { key: "luta", nome: "Luta", attr: "FOR", penalidade: false, treinado: false },
  { key: "misticismo", nome: "Misticismo", attr: "INT", penalidade: false, treinado: true },
  { key: "nobreza", nome: "Nobreza", attr: "INT", penalidade: false, treinado: true },
  { key: "oficio1", nome: "Ofício", attr: "INT", penalidade: false, treinado: true, isCustom: true },
  { key: "oficio2", nome: "Ofício", attr: "INT", penalidade: false, treinado: true, isCustom: true },
  { key: "percepcao", nome: "Percepção", attr: "SAB", penalidade: false, treinado: false },
  { key: "pilotagem", nome: "Pilotagem", attr: "DES", penalidade: false, treinado: true },
  { key: "pontaria", nome: "Pontaria", attr: "DES", penalidade: false, treinado: false },
  { key: "reflexos", nome: "Reflexos", attr: "DES", penalidade: false, treinado: false },
  { key: "religiao", nome: "Religião", attr: "SAB", penalidade: false, treinado: true },
  { key: "sobrevivencia", nome: "Sobrevivência", attr: "SAB", penalidade: false, treinado: false },
  { key: "vontade", nome: "Vontade", attr: "SAB", penalidade: false, treinado: false },
]

function buildEmptyForm() {
  const periciasObj = {}
  for (const p of PERICIAS_DEF) {
    periciasObj[p.key] = {
      treino: 0,
      outros: "",
      attr: p.attr,
      customName: p.isCustom ? "" : p.nome,
    }
  }

  return {
    id: null,
    nome: "",
    jogador: "",
    raca: "",
    origem: "",
    classe: "",
    nivel: 1,
    divindade: "",
    atributos: { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 },
    pv_max: 20,
    pv_atual: 20,
    pm_max: 5,
    pm_atual: 5,
    defesa_atributo: "DES",
    defesa_outros: 0,
    defesaId: null,
    armadura_nome: "",
    armadura_defesa: 0,
    armadura_penalidade: 0,
    escudo_nome: "",
    escudo_defesa: 0,
    escudo_penalidade: 0,
    tamanho: "Médio",
    tamanho_mod: "0 / 0",
    deslocamento: 9,
    xp_atual: 0,
    xp_max: 1000,
    pericias: periciasObj,
    inventario1: [],
    inventario2: [],
    tibares: 0,
    anotacoes: "",
  }
}

export default {
  html,
  data() {
    return {
      viewMode: 'list',
      wizardOpen: false,
      systemPickerOpen: false,
      systemPickerMode: "manual",
      systemPickerTrigger: null,
      generalCreateOpen: false,
      currentFichaSystem: "tormenta",
      generalCharacter: { nome: "", jogador: "", armas: [], habilidade: [], pericias: [], defesa: [], historico: [], accounts: [], camposSimples: [] },
      generalNameEditing: false,
      generalNameDraft: "",
      generalNameSaving: false,
      generalSection: "armas",
      generalEditorOpen: false,
      deletingFicha: false,
      generalEditorType: "",
      generalEditorIndex: null,
      generalDraft: {},
      generalSaving: false,
      generalLoading: false,
      generalLoadError: "",
      generalLoadRequest: 0,
      generalDiceFormula: "1d20",
      generalDiceResult: null,
      generalDiceError: "",
      wizardStep: 1,
      wizardRaca: null,
      wizardNome: "",
      wizardJogador: "",
      wizardClasse: "",
      wizardDivindade: "",
      wizardOrigem: "",
      wizardDescricao: "",
      wizardAtributos: { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 },
      wizardRacaSearchTerm: "",
      wizardDivindadeSearchTerm: "",
      wizardDragging: null,
      wizardDropKey: null,
      wizardRacialChoices: [],
      fichasApi: [],
      searchTerm: '',
      systemFilter: "todos",
      loading: false,
      creatingFicha: false,
      historicoCarregado: [],

      characters: [],
      selectedCharId: null,
      saveFeedback: false,
      autoSaveTimer: null,
      autoSaveState: "",
      autoSaveSuspended: false,
      autoSaveInFlight: false,
      autoSavePromise: null,
      leavingFicha: false,
      autoSaveQueued: false,
      sectionMenuOpen: false,
      sectionOpen: false,
      activeTab: "pericias",
      openingFicha: false,
      fichaLoadVersion: 0,
      fichasLoaded: false,
      fichasRequest: null,
      fichasRequestUser: null,
      fichasRequestVersion: 0,
      fichasLastLoaded: 0,
      fichasOwnerId: null,
      fichasError: "",
      editingAttr: null,
      nivelAnterior: 1,

      showEquipPopup: false,
      activeEquipTab: "armas",
      armasSearchTerm: "",
      expandedArmaIndex: null,
      expandedArmaCarregadaId: null,
      expandedAtaqueArmaId: null,
      armasData: ARMAS_DATA,
      armasCarregadas: [],

      protecoesSearchTerm: "",
      expandedProtecaoIndex: null,
      expandedProtecaoCarregadaId: null,
      protecoesData: PROTECOES_DATA,
      protecoesCarregadas: [],
      protecaoTipoTab: "todas",

      equipamentosSearchTerm: "",
      expandedEquipamentoIndex: null,
      expandedEquipamentoCarregadoId: null,
      equipamentosData: EQUIPAMENTOS_DATA,
      equipamentosCarregados: [],

      showMagiasPopup: false,
      magiasSearchTerm: "",
      expandedMagiaIndex: null,
      expandedMagiaCarregadaId: null,
      activeMagiaTipoTab: "todas",
      activeMagiaCirculoTab: "todos",
      magiasData: MAGIAS_DATA,
      magiasCarregadas: [],

      showHabilidadesPopup: false,
      habilidadesSearchTerm: "",
      expandedHabilidadeIndex: null,
      expandedHabilidadeCarregadaId: null,
      activeHabilidadeTab: "geral",
      activeClasseTab: null,
      habilidadesData: HABILIDADES_DATA,
      habilidadesCarregadas: [],

      showCriarPopup: false,
      criarTipo: null,
      criarTipoSelector: false,
      editArmaMode: false,
      editArmaId: null,
      editProtecaoMode: false,
      editProtecaoId: null,
      editEquipamentoMode: false,
      editEquipamentoId: null,
      editMagiaMode: false,
      editMagiaId: null,
      editHabilidadeMode: false,
      editHabilidadeId: null,
      novaArmaForm: { nome: "", preco: 0, dadoDeDano: "1d4", alcance: "Curto", peso: 0, tipoDano: "—", tipoArma: "Arma Simples", critico: 20, multiplicador: 2, atributo: "FOR", pericia: "Luta", descricao: "" },
      novaMagiaForm: { nome: "", tipoMagia: "Arcana", Circulo: "1º Círculo", execucao: "padrão", alcance: "curto", alvo: "", duracao: "cena", gastoPe: 1, truque: "", descricao: "" },
      novaHabilidadeForm: { nome: "", classe: "Geral", gastoPe: null, descricao: "" },
      novaProtecaoForm: { nome: "", preco: 0, bonus: 0, penalidade: 0, peso: 0, tipoProtecao: "Leve", descricao: "" },
      novaEquipamentoForm: { nome: "", peso: 0, descricao: "" },

      editAtributos: false,

      CLASSES,
      ORIGENS,
      DIVINDADES,
      RACAS,
      PERICIAS_DEF,
      CUSTO_ATRIBUTO,
      ATRIBUTOS_WIZARD,

      form: buildEmptyForm(),

      get fichaSections() {
        return [
          { key: "pericias", label: "Perícias", icon: "casino" },
          { key: "inventario", label: "Inventário", icon: "backpack" },
          { key: "magias", label: "Magias", icon: "auto_fix_high" },
          { key: "habilidades", label: "Habilidades", icon: "auto_awesome" },
          { key: "descricao", label: "Descrição", icon: "notes" },
          { key: "ataques", label: "Ataques", icon: "swords" },
          { key: "historico", label: "Histórico", icon: "history" },
        ]
      },

      get activeSectionLabel() {
        return this.fichaSections.find(s => s.key === this.activeTab)?.label || "Sessão"
      },

      get hasOpenFicha() {
        return this.viewMode === "edit" && Boolean(this.selectedCharId)
      },

      get shouldShowFicha() {
        return this.hasOpenFicha && this.isFichaRoute
      },

      get isGeneralFicha() {
        return this.currentFichaSystem === "geral"
      },

      get generalEditorTitle() {
        const titles = { armas: "Arma", habilidade: "Habilidade", pericias: "Perícia", defesa: "Defesa", historico: "Registro de histórico", accounts: "Contador", camposSimples: "Campo" }
        return `${this.generalEditorIndex == null ? "Adicionar" : "Editar"} ${titles[this.generalEditorType] || "elemento"}`
      },

      get generalEditorFields() {
        const fields = {
          armas: [
            ["nome", "Nome", "text"], ["dadoDeDano", "Dado de dano", "text"], ["alcance", "Alcance", "text"],
            ["tipoDano", "Tipo de dano", "text"], ["tipoArma", "Tipo de arma", "text"], ["atributo", "Atributo", "text"],
            ["pericia", "Perícia", "text"], ["preco", "Preço", "number"], ["peso", "Peso", "number"],
            ["critico", "Crítico", "number"], ["multiplicador", "Multiplicador", "number"], ["descricao", "Descrição", "textarea"],
            ["equiped", "Arma equipada", "checkbox"],
          ],
          habilidade: [["nome", "Nome", "text"], ["custo", "Custo", "number"], ["descricao", "Descrição", "textarea"]],
          pericias: [["nome", "Nome da perícia", "text"], ["atributo", "Atributo", "text"], ["treino", "Treino", "number"], ["outros", "Outros", "number"]],
          defesa: [["atributos", "Atributos", "text"], ["outros", "Outros", "number"]],
          historico: [["value", "Registro", "textarea"]],
          accounts: [["name", "Nome", "text"], ["currentValue", "Valor atual", "number"], ["maximumValue", "Valor máximo", "number"], ["color", "Cor", "color"], ["accontantType", "Tipo de exibição", "text"]],
          camposSimples: [["nome", "Nome do campo", "text"], ["value", "Valor", "text"]],
        }
        return (fields[this.generalEditorType] || []).map(([key, label, type]) => ({ key, label, type }))
      },

      get generalSections() {
        return [
          { key: "camposSimples", label: "Campos", icon: "text_fields", count: this.generalCharacter.camposSimples.length },
          { key: "accounts", label: "Contadores", icon: "tune", count: this.generalCharacter.accounts.length },
          { key: "armas", label: "Armas", icon: "swords", count: this.generalCharacter.armas.length },
          { key: "habilidade", label: "Habilidades", icon: "auto_awesome", count: this.generalCharacter.habilidade.length },
          { key: "pericias", label: "Perícias", icon: "psychology", count: this.generalCharacter.pericias.length },
          { key: "defesa", label: "Defesa", icon: "shield", count: this.generalCharacter.defesa.length },
          { key: "historico", label: "Histórico", icon: "history", count: this.generalCharacter.historico.length },
        ]
      },

      get activeGeneralSection() {
        const details = {
          camposSimples: { description: "Adicione campos de texto para personalizar sua ficha. Alterações salvas neste dispositivo.", empty: "Personalize sua ficha", action: "Adicionar campo" },
          accounts: { description: "Acompanhe vida, energia e outros recursos do personagem.", empty: "Nenhum contador por enquanto", action: "Adicionar contador" },
          armas: { description: "Organize as armas, o dano e os equipamentos de combate do personagem.", empty: "Seu arsenal começa aqui", action: "Adicionar primeira arma" },
          habilidade: { description: "Reúna poderes, talentos e habilidades especiais com seus custos e efeitos.", empty: "Nenhuma habilidade por enquanto", action: "Adicionar habilidade" },
          pericias: { description: "Defina as perícias, os atributos associados e os bônus do personagem.", empty: "Quais são seus talentos?", action: "Adicionar perícia" },
          defesa: { description: "Configure os atributos e modificadores usados na defesa do personagem.", empty: "Defina sua defesa", action: "Configurar defesa" },
          historico: { description: "Registre acontecimentos, descobertas e momentos da sua aventura.", empty: "Uma história para escrever", action: "Criar primeiro registro" },
        }
        return { ...this.generalSections.find(section => section.key === this.generalSection), ...details[this.generalSection] }
      },

      loadGeneralElements(ficha) {
        const defaults = {
          armas: Array.isArray(ficha.armas) ? ficha.armas.map(item => ({ ...item })) : [],
          habilidade: Array.isArray(ficha.habilidade) ? ficha.habilidade.map(item => ({ ...item })) : [],
          pericias: Array.isArray(ficha.pericias) ? ficha.pericias.map(item => ({ ...item })) : [],
          defesa: Array.isArray(ficha.defesa) ? ficha.defesa.map(item => ({ ...item })) : [],
          accounts: Array.isArray(ficha.accounts) ? ficha.accounts.map(item => ({ ...item, currentValue: item.currentValue ?? item.value ?? 0, maximumValue: item.maximumValue ?? 0, color: item.color || "#b4233c" })) : [],
          camposSimples: Array.isArray(ficha.camposSimples) ? ficha.camposSimples.filter(item => item && typeof item === "object").map(item => ({ ...item, value: String(item.value ?? "") })) : [],
          historico: Array.isArray(ficha.historico) ? ficha.historico.map(item => ({ ...item })) : [],
        }
        try {
          const saved = JSON.parse(localStorage.getItem(`grimorio_general_ficha_${ficha.id}`) || "null")
          if (saved && typeof saved === "object") {
            for (const key of Object.keys(defaults)) {
              if (Array.isArray(saved[key])) {
                if (["pericias", "habilidade", "accounts", "camposSimples"].includes(key)) {
                  defaults[key].push(...saved[key].filter(item => item && (!item.id || item._generalLocal)).map(item => key === "accounts" ? ({ ...item, currentValue: item.currentValue ?? item.value ?? 0, maximumValue: item.maximumValue ?? 0, color: item.color || "#b4233c", _generalLocal: true }) : ({ ...item, _generalLocal: true })))
                } else defaults[key] = saved[key]
              }
            }
          }
        } catch (err) {
          console.warn("Não foi possível carregar elementos locais da ficha geral.", err)
        }
        return defaults
      },

      saveGeneralElements() {
        if (!this.selectedCharId) return
        const { armas, habilidade, pericias, defesa, historico, accounts, camposSimples } = this.generalCharacter
        try {
          localStorage.setItem(`grimorio_general_ficha_${this.selectedCharId}`, JSON.stringify({ armas, defesa, historico, camposSimples: camposSimples.filter(item => !this.isGeneralRemoteElement(item)), habilidade: habilidade.filter(item => !this.isGeneralRemoteElement(item)), pericias: pericias.filter(item => !this.isGeneralRemoteElement(item)), accounts: accounts.filter(item => !this.isGeneralRemoteElement(item)) }))
        } catch (err) {
          console.warn("Não foi possível guardar elementos locais da ficha geral.", err)
          this.$store.toasts.push("Não foi possível guardar as alterações neste dispositivo.", "error")
        }
      },

      get isFichaRoute() {
        return this.$router.is(...FICHA_PATHS)
      },

      get fichasFiltradas() {
        const term = this.searchTerm.toLowerCase().trim()
        return this.fichasApi.filter(f => {
          const sistema = f.sistema || "tormenta"
          if (this.systemFilter !== "todos" && sistema !== this.systemFilter) return false
          if (!term) return true
          return (f.nomePersonagem || '').toLowerCase().includes(term) ||
            (f.classe || '').toLowerCase().includes(term) ||
            (f.nomeJogador || '').toLowerCase().includes(term) ||
            limparEmojiRaca(f.raca || '').toLowerCase().includes(term)
        })
      },

      get armasFiltradas() {
        const term = this.armasSearchTerm.toLowerCase().trim()
        if (!term) return this.armasData
        return this.armasData.filter(a =>
          (a.nome || '').toLowerCase().includes(term) ||
          (a.dadoDeDano || '').toLowerCase().includes(term) ||
          (a.tipoDano || '').toLowerCase().includes(term) ||
          (a.tipoArma || '').toLowerCase().includes(term) ||
          (a.descricao || '').toLowerCase().includes(term)
        )
      },

      get armasEquipadas() {
        return this.armasCarregadas.filter(a => a.equiped)
      },

      get protecoesFiltradas() {
        const term = this.protecoesSearchTerm.toLowerCase().trim()
        let list = this.protecoesData
        if (this.protecaoTipoTab !== "todas") {
          list = list.filter(p => p.tipo === this.protecaoTipoTab)
        }
        if (!term) return list
        return list.filter(p =>
          (p.nome || '').toLowerCase().includes(term) ||
          (p.tipo || '').toLowerCase().includes(term) ||
          (p.descricao || '').toLowerCase().includes(term)
        )
      },

      get protecoesEquipadas() {
        return this.protecoesCarregadas.filter(p => p.equipada)
      },

      get equipamentosFiltrados() {
        const term = this.equipamentosSearchTerm.toLowerCase().trim()
        if (!term) return this.equipamentosData
        return this.equipamentosData.filter(eq =>
          (eq.nome || '').toLowerCase().includes(term) ||
          (eq.descricao || '').toLowerCase().includes(term)
        )
      },

      get equipamentosCarregadosFiltrados() {
        const term = this.equipamentosSearchTerm.toLowerCase().trim()
        if (!term) return this.equipamentosCarregados
        return this.equipamentosCarregados.filter(eq =>
          (eq.nome || '').toLowerCase().includes(term) ||
          (eq.descricao || '').toLowerCase().includes(term)
        )
      },

      get PROTECAO_TIPOS() {
        return [...new Set(PROTECOES_DATA.map(p => p.tipo).filter(Boolean))]
      },

      get ATRIBUTOS_LIST() {
        return ATRIBUTOS
      },

      get PERICIAS_LIST() {
        return PERICIAS_DEF.map(p => p.nome)
      },

      get CRIAR_OPCOES_TIPO_MAGIA() {
        return [...new Set(MAGIAS_DATA.map(m => m.tipoMagia).filter(Boolean))]
      },

      get CRIAR_OPCOES_CIRCULO() {
        return [...new Set(MAGIAS_DATA.map(m => m.Circulo).filter(Boolean))]
      },

      get CRIAR_OPCOES_EXECUCAO() {
        return [...new Set(MAGIAS_DATA.map(m => m.execucao).filter(Boolean))]
      },

      get CRIAR_OPCOES_TIPO_ARMA() {
        return [...new Set(ARMAS_DATA.map(a => a.tipoArma).filter(Boolean))]
      },

      get CRIAR_OPCOES_ALCANCE_ARMA() {
        return [...new Set(ARMAS_DATA.map(a => a.alcance).filter(Boolean))]
      },

      get CRIAR_OPCOES_TIPO_DANO() {
        return [...new Set(ARMAS_DATA.map(a => a.tipoDano).filter(Boolean))]
      },

      get CRIAR_OPCOES_CLASSE() {
        return ["Geral", ...this.habClasses]
      },

      get magiasCirculos() {
        const vistos = []
        for (const m of this.magiasData) {
          if (m.Circulo && !vistos.includes(m.Circulo)) vistos.push(m.Circulo)
        }
        return vistos.sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0))
      },

      get magiasFiltradas() {
        const term = this.magiasSearchTerm.toLowerCase().trim()
        return this.magiasData.filter(m =>
          (this.activeMagiaTipoTab === "todas" || (m.tipoMagia || '').toLowerCase() === this.activeMagiaTipoTab) &&
          (this.activeMagiaCirculoTab === "todos" || (m.Circulo || '') === this.activeMagiaCirculoTab) &&
          (!term ||
            (m.nome || '').toLowerCase().includes(term) ||
            (m.tipoMagia || '').toLowerCase().includes(term) ||
            (m.Circulo || '').toLowerCase().includes(term) ||
            (m.descricao || '').toLowerCase().includes(term) ||
            (m.alvo || '').toLowerCase().includes(term))
        )
      },

      get habClasses() {
        const vistos = []
        for (const h of this.habilidadesData) {
          const cl = (h.classe || '').trim()
          if (!cl) continue
          const cll = cl.toLowerCase()
          if (cll === "geral" || cll.startsWith("origem") || cll.startsWith("raça")) continue
          if (!vistos.includes(cl)) vistos.push(cl)
        }
        return vistos
      },

      get habilidadesFiltradas() {
        const term = this.habilidadesSearchTerm.toLowerCase().trim()
        const matches = h => {
          if (!term) return true
          return (h.nome || '').toLowerCase().includes(term) ||
            (h.descricao || '').toLowerCase().includes(term) ||
            (h.classe || '').toLowerCase().includes(term)
        }
        return this.habilidadesData.filter(h => {
          const classe = (h.classe || '').trim().toLowerCase()
          if (this.activeHabilidadeTab === "geral") {
            return matches(h)
          }
          if (this.activeHabilidadeTab === "origem") {
            return classe.startsWith("origem") && matches(h)
          }
          if (this.activeHabilidadeTab === "raca") {
            return classe.startsWith("raça") && matches(h)
          }
          const ativa = (this.activeClasseTab || this.habClasses[0] || '').toLowerCase()
          if (classe !== ativa) return false
          return matches(h)
        })
      },

      get habilidadesCarregadasFiltradas() {
        if (this.activeHabilidadeTab === "geral") {
          return this.habilidadesCarregadas
        }
        if (this.activeHabilidadeTab === "origem") {
          return this.habilidadesCarregadas.filter(h => (h.classe || '').trim().toLowerCase().startsWith("origem"))
        }
        if (this.activeHabilidadeTab === "raca") {
          return this.habilidadesCarregadas.filter(h => (h.classe || '').trim().toLowerCase().startsWith("raça"))
        }
        return this.habilidadesCarregadas.filter(h => {
          const c = (h.classe || '').trim().toLowerCase()
          return c !== "geral" && !c.startsWith("origem") && !c.startsWith("raça")
        })
      },

      get pvPercent() {
        const max = Number(this.form.pv_max) || 0
        const cur = Number(this.form.pv_atual) || 0
        if (max <= 0) return 0
        const pct = (cur / max) * 100
        return Math.max(0, Math.min(100, pct))
      },

      get pmPercent() {
        const max = Number(this.form.pm_max) || 0
        const cur = Number(this.form.pm_atual) || 0
        if (max <= 0) return 0
        const pct = (cur / max) * 100
        return Math.max(0, Math.min(100, pct))
      },

      async init() {
        this.syncSheetBackgroundState()
        this.$watch("$router.path + '?' + ($router.query.id || '') + ':' + ($router.query.sistema || '')", () => this.syncCharacterRoute())
        this.$watch("form", () => {
          this.scheduleAutoSave()
        })
        this.$watch("viewMode", () => this.syncSheetBackgroundState())
        this.$watch("selectedCharId", () => this.syncSheetBackgroundState())
        this.$watch('$store.auth.user', async (user) => {
          if (this.fichasOwnerId === user?.id) return
          this.fichasRequestVersion++
          this.fichasRequest = null
          this.fichasRequestUser = null
          this.fichasOwnerId = user?.id || null
          this.fichasApi = []
          this.loading = false
          this.fichasError = ""
          this.fichasLoaded = false
          if (user) {
            await this.carregarFichas()
            await this.syncCharacterRoute()
          }
        })
        this.$watch('$store.masterView.ficha', (ficha) => {
          if (ficha) {
            this.abrirFicha(ficha)
            this.$store.masterView.ficha = null
          }
        })
        if (typeof window !== "undefined") {
          window.addEventListener("general-dice-result", e => {
            const { fichaId, result, value, error } = e.detail || {}
            if (!this.isGeneralFicha || !this.selectedCharId || String(fichaId) !== String(this.selectedCharId)) return
            this.generalDiceError = error || ""
            this.generalDiceResult = result || null
            if (value) {
              this.generalCharacter.historico.unshift({ value })
              this.saveGeneralElements()
            }
          })
          window.addEventListener("historico-atualizado", (e) => {
            const { fichaId } = e.detail || {}
            if (fichaId && Number(fichaId) === Number(this.selectedCharId)) {
              this.loadHistoricoFicha(fichaId)
            }
          })
        }
        await this.carregarFichas()
        await this.syncCharacterRoute()
      },

      syncSheetBackgroundState() {
        this.$store.sheetBackground.setSheetOpen(this.viewMode === "edit" && Boolean(this.selectedCharId))
      },

      async syncCharacterRoute() {
        if (this.leavingFicha) return
        if (!this.$store.auth.user) {
          if (this.selectedCharId) this.voltarParaLista({ navigate: false })
          this.fichasApi = []
          return
        }
        if (!this.isFichaRoute) {
          if (this.selectedCharId) await this.sairDaFicha({ navigate: false })
          else this.viewMode = "list"
          if (this.$router.is('/personagens') && !this.loading && (!this.fichasLoaded || Date.now() - this.fichasLastLoaded > 30000)) await this.carregarFichas()
          return
        }
        const section = fichaSection(this.$router)
        const id = this.$router.query.id
        const sistema = this.$router.query.sistema === "geral" ? "geral" : "tormenta"
        if (this.selectedCharId && (!id || (String(this.selectedCharId) === String(id) && this.currentFichaSystem === sistema))) {
          this.openFichaSection(section, { updateRoute: false })
          if (!id) this.$router.replace(fichaPath(section, this.selectedCharId, this.currentFichaSystem))
          return
        }
        if (!this.fichasLoaded || !this.$store.auth.user) return
        if (this.selectedCharId) {
          const destination = this.$router.resolve()
          if (!await this.sairDaFicha({ navigate: false })) return
          if (this.$router.resolve() !== destination) return
        }
        const ficha = this.fichasApi.find(item => String(item.id) === String(id) && (item.sistema || "tormenta") === sistema)
        if (ficha) await this.abrirFicha(ficha, { updateRoute: false })
        else this.$router.replace("/personagens")
      },

      navigateCharacterRoute(section = this.activeTab) {
        this.$router.push(fichaPath(section, this.selectedCharId, this.currentFichaSystem))
      },

      async carregarFichas() {
        const user = this.$store.auth.user
        if (!user) return
        if (this.fichasRequest && this.fichasRequestUser === user.id) return this.fichasRequest
        if (this.fichasOwnerId !== user.id) {
          this.fichasApi = []
          this.fichasLoaded = false
          this.fichasOwnerId = user.id
        }
        const version = ++this.fichasRequestVersion
        this.loading = true
        this.fichasError = ""
        this.fichasRequestUser = user.id
        this.fichasRequest = (async () => {
          try {
            const { data } = await getFichasByUser(user.id)
            if (this.$store.auth.user?.id !== user.id || version !== this.fichasRequestVersion) return
            this.fichasApi = Array.isArray(data?.data) ? data.data : []
            this.fichasLastLoaded = Date.now()
            this.fichasLoaded = true
          } catch (err) {
            if (this.$store.auth.user?.id !== user.id || version !== this.fichasRequestVersion) return
            console.error('Erro ao carregar fichas:', err)
            this.fichasError = this.fichasApi.length ? "Não foi possível atualizar as fichas. Seus personagens continuam abaixo." : "Não foi possível carregar seus personagens."
          } finally {
            if (version === this.fichasRequestVersion) {
              this.loading = false
              this.fichasRequest = null
              this.fichasRequestUser = null
            }
          }
        })()
        return this.fichasRequest
      },

      async abrirFicha(ficha, { updateRoute = true } = {}) {
        if (this.leavingFicha || this.generalSaving) return
        this.generalEditorOpen = false
        const loadVersion = ++this.fichaLoadVersion
        this.openingFicha = true
        this.autoSaveSuspended = true
        this.clearAutoSaveTimer()
        this.selectedCharId = ficha.id
        this.currentFichaSystem = ficha.sistema || "tormenta"
        const generalElements = this.currentFichaSystem === "geral" ? this.loadGeneralElements(ficha) : null
        this.generalCharacter = {
          nome: ficha.nomePersonagem || "",
          jogador: ficha.nomeJogador || "",
          armas: generalElements?.armas || [],
          habilidade: generalElements?.habilidade || [],
          pericias: generalElements?.pericias || [],
          defesa: generalElements?.defesa || [],
          historico: generalElements?.historico || [],
          accounts: generalElements?.accounts || [],
          camposSimples: generalElements?.camposSimples || [],
        }
        this.generalSection = "armas"
        this.generalDiceResult = null
        this.generalDiceError = ""
        this.generalDiceFormula = "1d20"
        this.form = {
          id: ficha.id,
          nome: ficha.nomePersonagem || '',
          jogador: ficha.nomeJogador || '',
          raca: adicionarEmojiRaca(ficha.raca) || '',
          origem: ficha.origem || '',
          classe: limparEmojiClasse(ficha.classe),
          nivel: ficha.nivel || 1,
          divindade: ficha.divindade || '',
          atributos: {
            FOR: ficha.for || 10,
            DES: ficha.des || 10,
            CON: ficha.con || 10,
            INT: ficha.int || 10,
            SAB: ficha.sab || 10,
            CAR: ficha.car || 10,
          },
          pv_max: ficha.pvMax || 20,
          pv_atual: ficha.pvCurrent || 20,
          pm_max: ficha.pmMax || 5,
          pm_atual: ficha.pmCurrent || 5,
          defesa_atributo: ficha.defesa
            ? this.normalizeDefesaAtributo(ficha.defesa.atributos)
            : "DES",
          defesa_outros: ficha.defesa ? Number(ficha.defesa.outros) || 0 : 0,
          defesaId: ficha.defesa ? ficha.defesa.id : null,
          armadura_nome: '',
          armadura_defesa: 0,
          armadura_penalidade: 0,
          escudo_nome: '',
          escudo_defesa: 0,
          escudo_penalidade: 0,
          tamanho: ficha.tamanho || 'Médio',
          tamanho_mod: ficha.tamanho_mod || '0 / 0',
          deslocamento: ficha.deslocamento || 9,
          xp_atual: 0,
          xp_max: 1000,
          pericias: this.buildPericiasFromFicha(ficha),
          inventario1: [],
          inventario2: [],
          tibares: this.toNum(ficha.tibao, this.toNum(ficha.tibares, 0)),
          anotacoes: ficha.descricao || '',
        }
        this.activeTab = fichaSection(this.$router)
        this.viewMode = 'edit'
        this.sectionOpen = false
        this.sectionMenuOpen = false
        this.nivelAnterior = this.toNum(ficha.nivel, 1)
        this.expandedArmaCarregadaId = null
        this.expandedMagiaCarregadaId = null
        this.expandedHabilidadeCarregadaId = null
        this.expandedAtaqueArmaId = null
        if (updateRoute) this.navigateCharacterRoute(this.activeTab)
        if (this.currentFichaSystem === "geral") {
          this.armasCarregadas = []
          this.protecoesCarregadas = []
          this.equipamentosCarregados = []
          this.magiasCarregadas = []
          this.habilidadesCarregadas = []
          this.historicoCarregado = []
          await this.loadGeneralRemoteElements()
        } else await Promise.all([
          this.loadArmasFicha(),
          this.loadProtecoesFicha(),
          this.loadEquipamentosFicha(),
          this.loadMagiasFicha(),
          this.loadHabilidadesFicha(),
          this.loadPericiasFicha(ficha.id),
          this.loadHistoricoFicha(ficha.id),
        ])
        if (loadVersion !== this.fichaLoadVersion) return
        this.$nextTick(() => {
          if (loadVersion !== this.fichaLoadVersion) return
          this.openingFicha = false
          this.autoSaveSuspended = false
          this.autoSaveState = ""
        })
      },

      buildPericiasFromFicha(ficha) {
        const pericias = {}
        for (const p of PERICIAS_DEF) {
          pericias[p.key] = {
            treino: 0,
            outros: "",
            attr: p.attr,
            customName: p.isCustom ? '' : p.nome,
          }
        }
        return pericias
      },

      async sairDaFicha({ navigate = true } = {}) {
        if (this.isGeneralFicha && this.generalSaving) return false
        if (this.leavingFicha) return false
        const returnPath = fichaPath(this.activeTab, this.selectedCharId, this.currentFichaSystem)
        let hasPendingChanges = Boolean(this.autoSaveTimer) || ["editando", "erro"].includes(this.autoSaveState) || this.autoSaveQueued
        this.leavingFicha = true
        this.clearAutoSaveTimer()
        try {
          if (this.autoSavePromise) {
            await this.autoSavePromise
            hasPendingChanges = hasPendingChanges || this.autoSaveQueued || this.autoSaveState === "erro"
          }
          if (hasPendingChanges) {
            this.autoSaveQueued = false
            const saved = await this.performAutoSave()
            if (!saved) {
              this.$store.toasts.push("Não foi possível salvar. A ficha permanece aberta para tentar novamente.", "error")
              this.$router.replace(returnPath)
              return false
            }
          }
          this.voltarParaLista({ navigate })
          return true
        } finally {
          this.leavingFicha = false
          if (!navigate && this.isFichaRoute && !this.selectedCharId) {
            this.$nextTick(() => this.syncCharacterRoute())
          }
        }
      },

      voltarParaLista({ navigate = true } = {}) {
        this.clearAutoSaveTimer()
        this.fichaLoadVersion++
        this.openingFicha = false
        this.autoSaveSuspended = false
        this.viewMode = 'list'
        this.selectedCharId = null
        this.sectionOpen = false
        this.sectionMenuOpen = false
        this.form = buildEmptyForm()
        this.expandedAtaqueArmaId = null
        this.armasCarregadas = []
        this.protecoesCarregadas = []
        this.equipamentosCarregados = []
        this.magiasCarregadas = []
        this.habilidadesCarregadas = []
        this.historicoCarregado = []
        if (navigate) this.$router.push("/personagens")
      },

      novaFicha() {
        this.selectedCharId = null
        this.form = buildEmptyForm()
        this.nivelAnterior = this.toNum(this.form.nivel, 1)
        this.viewMode = 'edit'
        this.sectionOpen = false
        this.sectionMenuOpen = false
      },

      abrirWizard(mode = "manual") {
        this.systemPickerTrigger = typeof document !== "undefined" ? document.activeElement : null
        this.systemPickerMode = mode
        this.systemPickerOpen = true
        this.$nextTick(() => this.$refs?.systemPicker?.focus())
      },

      closeSystemPicker() {
        this.systemPickerOpen = false
        this.$nextTick(() => this.systemPickerTrigger?.focus())
      },

      trapSystemPickerFocus(event) {
        const modal = this.$refs.systemPicker
        const buttons = [...modal.querySelectorAll('button:not(:disabled)')]
        const first = buttons[0], last = buttons[buttons.length - 1]
        if (event.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      },

      escolherSistemaPersonagem(sistema) {
        if (this.systemPickerMode === "aleatorio") {
          this.systemPickerMode = "manual"
          this.systemPickerOpen = false
          if (sistema === "geral") return this.criarFichaGeralAleatoria()
          return this.criarPersonagemAleatorio()
        }
        this.systemPickerOpen = false
        if (sistema === "geral") {
          this.generalCharacter = { nome: "", jogador: this.$store.auth.user?.name || "", armas: [], habilidade: [], pericias: [], defesa: [], historico: [], accounts: [], camposSimples: [] }
          this.generalCreateOpen = true
          return
        }
        this.wizardOpen = true
        this.wizardStep = 1
        this.wizardRaca = null
        this.wizardNome = ""
        this.wizardJogador = this.$store.auth.user?.name || ""
        this.wizardClasse = ""
        this.wizardDivindade = ""
        this.wizardOrigem = ""
        this.wizardDescricao = ""
        this.wizardAtributos = { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 }
        this.wizardRacialChoices = []
      },

      fecharWizard() {
        this.wizardOpen = false
      },

      openGeneralEditor(type, item = null, index = null) {
        if (this.generalSaving) return
        const defaults = {
          armas: { nome: "", preco: 0, dadoDeDano: "", alcance: "", peso: 0, tipoDano: "", tipoArma: "", critico: 20, multiplicador: 2, atributo: "", descricao: "", pericia: "", equiped: false },
          habilidade: { nome: "", descricao: "", custo: null },
          pericias: { nome: "", atributo: "", treino: 0, outros: 0 },
          defesa: { atributos: "", outros: 0 },
          historico: { value: "" },
          accounts: { name: "", currentValue: 0, maximumValue: 0, color: "#b4233c", accontantType: "bar" },
          camposSimples: { nome: "", value: "" },
        }
        this.generalEditorType = type
        this.generalEditorIndex = index
        this.generalDraft = { ...defaults[type], ...(item || {}) }
        this.generalEditorOpen = true
        this.$nextTick(() => this.$refs.generalEditor?.focus())
      },

      isGeneralRemoteElement(item) {
        return Number.isInteger(item?.id) && item.id > 0 && !item._generalLocal
      },

      limparNomeClasse(nome) {
        return limparEmojiClasse(nome)
      },

      async loadGeneralRemoteElements() {
        const fichaId = this.selectedCharId
        const character = this.generalCharacter
        const request = ++this.generalLoadRequest
        this.generalLoading = true
        this.generalLoadError = ""
          const types = ["pericias", "habilidade", "accounts", "camposSimples"]
        const results = await Promise.allSettled(types.map(type => generalApi.list(type, fichaId)))
        if (request !== this.generalLoadRequest) return
        this.generalLoading = false
        if (this.generalCharacter !== character || !this.isGeneralFicha) return
        const failed = []
        results.forEach((result, index) => {
          const type = types[index]
          if (result.status === "fulfilled") {
          const drafts = character[type].filter(item => !this.isGeneralRemoteElement(item))
            character[type] = [...result.value, ...drafts]
          } else failed.push({ pericias: "perícias", habilidade: "habilidades", accounts: "contadores", camposSimples: "campos" }[type])
        })
        if (failed.length) this.generalLoadError = `Não foi possível carregar: ${failed.join(", ")}. Tente novamente.`
      },

      async saveGeneralElement() {
        if (this.generalSaving) return
        const type = this.generalEditorType
        const index = this.generalEditorIndex
        let item = { ...this.generalDraft }
        const name = type === "accounts" ? item.name : item.nome
        if (type === "historico" ? !item.value?.trim() : type !== "defesa" && !name?.trim()) {
          this.$store.toasts.push("Preencha o nome ou conteúdo antes de adicionar.", "error")
          return
        }
        for (const field of this.generalEditorFields) {
          if (field.type === "number") {
            item[field.key] = item[field.key] === "" || item[field.key] == null ? (field.key === "custo" ? null : 0) : Number(item[field.key])
            if (item[field.key] != null && (!Number.isFinite(item[field.key]) || (field.key !== "peso" && !Number.isInteger(item[field.key])))) {
              this.$store.toasts.push("Informe valores numéricos válidos.", "error")
              return
            }
          }
        }
        if (type === "pericias" && !item.atributo?.trim()) {
          this.$store.toasts.push("Informe o atributo da perícia.", "error")
          return
        }
        const character = this.generalCharacter
        this.generalSaving = true
        try {
          if (["pericias", "habilidade", "accounts", "camposSimples"].includes(type)) {
            const payload = Object.fromEntries(this.generalEditorFields.map(field => [field.key, item[field.key]]))
            item = await generalApi.save(type, this.selectedCharId, payload, this.isGeneralRemoteElement(item) ? item.id : null)
          } else item.id ??= generateId()
          if (this.generalCharacter !== character) return
          if (type === "defesa") character.defesa = [item]
          else if (index == null) character[type].push(item)
          else character[type].splice(index, 1, item)
          this.saveGeneralElements()
          this.generalEditorOpen = false
          this.$store.toasts.push("Elemento salvo na ficha.", "success")
        } catch (err) {
          this.$store.toasts.push(err.response?.data?.ErrorMessage || "Não foi possível salvar. Suas alterações continuam no formulário.", "error")
        } finally {
          this.generalSaving = false
        }
      },

      async removeGeneralElement(type, index) {
        if (this.generalSaving) return
        const character = this.generalCharacter
        const item = character[type][index]
        if (!item) return
        if (type === "pericias" && this.isGeneralRemoteElement(item)) {
          this.$store.toasts.push("A exclusão de perícias ainda não está disponível.", "info")
          return
        }
        this.generalSaving = true
        try {
          if (["habilidade", "accounts", "camposSimples"].includes(type) && this.isGeneralRemoteElement(item)) await generalApi.remove(type, item.id)
          if (this.generalCharacter !== character) return
          character[type].splice(index, 1)
          this.saveGeneralElements()
        } catch (err) {
          this.$store.toasts.push(err.response?.data?.ErrorMessage || "Não foi possível remover o elemento.", "error")
        } finally {
          this.generalSaving = false
        }
      },

      async changeGeneralAccount(item, currentValue, field = "currentValue") {
        if (this.generalSaving) return
        const number = Number(currentValue)
        if (!Number.isInteger(number) || currentValue === "") {
          this.$store.toasts.push("Informe um valor inteiro.", "error")
          return
        }
        const character = this.generalCharacter
        this.generalSaving = true
        try {
          if (this.isGeneralRemoteElement(item)) {
            const saved = await generalApi.save("accounts", this.selectedCharId, { [field]: number }, item.id)
            if (this.generalCharacter === character) Object.assign(item, saved)
          } else {
            item[field] = number
            this.saveGeneralElements()
          }
        } catch (err) {
          this.$store.toasts.push("Não foi possível atualizar o contador.", "error")
        } finally {
          this.generalSaving = false
        }
      },

      editarNomeFichaGeral() {
        this.generalNameDraft = this.generalCharacter.nome || ""
        this.generalNameEditing = true
        this.$nextTick(() => this.$refs.generalNameInput?.focus())
      },

      async salvarNomeFichaGeral() {
        const nome = this.generalNameDraft.trim()
        if (!nome) {
          this.$store.toasts.push("Informe o nome do personagem.", "error")
          return
        }
        if (nome.length > 100) {
          this.$store.toasts.push("O nome deve ter até 100 caracteres.", "error")
          return
        }
        this.generalNameSaving = true
        try {
          const { data } = await updateFicha(this.selectedCharId, { nomePersonagem: nome }, "geral")
          this.generalCharacter.nome = data?.fichaGeral?.nomePersonagem || nome
          const ficha = this.fichasApi.find(item => String(item.id) === String(this.selectedCharId))
          if (ficha) ficha.nomePersonagem = this.generalCharacter.nome
          this.generalNameEditing = false
          this.$store.toasts.push("Nome do personagem atualizado.", "success")
        } catch (err) {
          this.$store.toasts.push(err.response?.data?.ErrorMessage || "Não foi possível atualizar o nome.", "error")
        } finally {
          this.generalNameSaving = false
        }
      },

      rollGeneralDice() {
        if (!this.selectedCharId || !this.isGeneralFicha) return
        if (!this.generalDiceFormula.trim()) {
          this.generalDiceError = "Informe uma fórmula, como 1d20+3."
          return
        }
        window.dispatchEvent(new CustomEvent("roll-dice", {
          detail: { formula: this.generalDiceFormula.trim(), label: "Rolagem de dados", fichaId: this.selectedCharId, sistema: "geral" },
        }))
      },

      async criarFichaGeral() {
        const user = this.$store.auth.user
        if (!user) return
        const nomePersonagem = this.generalCharacter.nome.trim() || "Personagem sem Nome"
        this.creatingFicha = true
        try {
          const { data } = await createFicha({
            jogadorId: user.id,
            nomePersonagem,
            nomeJogador: this.generalCharacter.jogador.trim() || user.name || "Jogador",
          }, "geral")
          this.generalCreateOpen = false
          await this.carregarFichas()
          const idCriada = data?.fichaGeral?.id
          const criada = idCriada
            ? this.fichasApi.find(ficha => String(ficha.id) === String(idCriada))
            : this.fichasApi.find(ficha => ficha.sistema === "geral" && ficha.nomePersonagem === nomePersonagem)
          if (criada) this.abrirFicha(criada)
          else this.$store.toasts.push(data?.message || "Ficha geral criada com sucesso!", "success")
        } catch (err) {
          console.error("Erro ao criar ficha geral:", err)
          this.$store.toasts.push("Não foi possível criar a ficha geral.", "error")
        } finally {
          this.creatingFicha = false
        }
      },

      async criarFichaGeralAleatoria() {
        const user = this.$store.auth.user
        if (!user || this.creatingFicha || this.openingFicha || this.selectedCharId) return
        const sortear = lista => lista[Math.floor(Math.random() * lista.length)]
        const nomePersonagem = `${sortear(NOMES_ALEATORIOS)} ${sortear(SOBRENOMES_ALEATORIOS)}`
        const campos = [
          { nome: "Conceito", value: sortear(["Aventureiro", "Pesquisador", "Sobrevivente", "Viajante"]) },
          { nome: "Origem", value: sortear(["Terras distantes", "Uma cidade antiga", "Uma comunidade isolada", "Sem memória da origem"]) },
          { nome: "Objetivo", value: sortear(["Encontrar respostas", "Proteger alguém", "Descobrir novos lugares", "Recomeçar"]) },
          { nome: "Afiliação", value: sortear(["Sem afiliação", "Uma guilda local", "Um grupo independente", "Uma ordem antiga"]) },
          { nome: "Anotação", value: sortear(["Carrega um segredo", "Tem um contato importante", "Procura um artefato", "Evita falar do passado"]) },
        ]
        const paleta = ["#b4233c", "#2563eb", "#15803d", "#9333ea", "#d97706"]
        const contas = ["Vida", "Energia", "Mana", "Fôlego", "Sanidade"].map((name, index) => {
          const maximumValue = sortear([10, 12, 20, 30, 50])
          return { name, currentValue: Math.floor(Math.random() * (maximumValue + 1)), maximumValue, color: paleta[index], accontantType: "bar" }
        })
        this.creatingFicha = true
        try {
          const { data } = await createFicha({ jogadorId: user.id, nomePersonagem, nomeJogador: user.name || "Jogador" }, "geral")
          const fichaId = data?.fichaGeral?.id
          if (!fichaId) throw new Error("A ficha geral não foi retornada pela API")
          const resultados = await Promise.allSettled([
            ...campos.map(item => generalApi.save("camposSimples", fichaId, item)),
            ...contas.map(item => generalApi.save("accounts", fichaId, item)),
          ])
          const falhas = resultados.filter(resultado => resultado.status === "rejected").length
          await this.carregarFichas()
          const criada = this.fichasApi.find(ficha => String(ficha.id) === String(fichaId))
          if (criada) await this.abrirFicha(criada)
          this.$store.toasts.push(falhas ? `Ficha criada; ${falhas} campo(s) ou contador(es) não puderam ser salvos.` : "Ficha geral aleatória criada com cinco campos e cinco contadores.", falhas ? "info" : "success")
        } catch (err) {
          console.error("Erro ao criar ficha geral aleatória:", err)
          this.$store.toasts.push("Não foi possível criar a ficha geral aleatória.", "error")
        } finally {
          this.creatingFicha = false
        }
      },

      async criarPersonagemAleatorio() {
        if (this.creatingFicha || this.openingFicha || this.selectedCharId || !this.$store.auth.user) return
        const sortear = lista => lista[Math.floor(Math.random() * lista.length)]
        this.escolherSistemaPersonagem("tormenta")
        this.escolherRaca(sortear(this.wizardRacas))
        this.wizardNome = `${sortear(NOMES_ALEATORIOS)} ${sortear(SOBRENOMES_ALEATORIOS)}`
        this.wizardClasse = sortear(CLASSES)
        this.wizardOrigem = sortear(ORIGENS)
        this.wizardDivindade = sortear(DIVINDADES)
        this.wizardAtributos = Object.fromEntries(ATRIBUTOS.map(key => [key, MIN_ATRIBUTO]))
        while (this.wizardPontosRestantes > 0) {
          const disponiveis = ATRIBUTOS.filter(key => this.wizardPodeAumentar(key))
          this.wizardInc(sortear(disponiveis))
        }
        const escolhasRaciais = ATRIBUTOS.filter(key => this.wizardRacialAtributoPermitido(key))
        while (!this.wizardRacialEscolhaCompleta) {
          const indice = Math.floor(Math.random() * escolhasRaciais.length)
          this.alternarRacialEscolha(escolhasRaciais.splice(indice, 1)[0])
        }
        this.wizardStep = 3
        await this.wizardFinalizar()
      },

      escolherRaca(raca) {
        this.wizardRaca = raca
        this.wizardRacialChoices = []
      },

      get wizardRacas() {
        return RACAS_DATA.map(raca => ({ ...raca, nome: limparEmojiRaca(raca.nome) }))
      },

      get wizardRacasFiltradas() {
        const term = (this.wizardRacaSearchTerm || "").toLowerCase().trim()
        if (!term) return this.wizardRacas
        return this.wizardRacas.filter(r =>
          limparEmojiRaca(r.nome).toLowerCase().includes(term) ||
          (r.atributos?.descricao_atributos || "").toLowerCase().includes(term) ||
          (r.habilidades || []).some(h => (h.nome || "").toLowerCase().includes(term) || (h.descricao || "").toLowerCase().includes(term))
        )
      },

      get wizardDivindadesFiltradas() {
        const term = (this.wizardDivindadeSearchTerm || "").toLowerCase().trim()
        if (!term) return DIVINDADES
        return DIVINDADES.filter(d => d.toLowerCase().includes(term))
      },

      get wizardAtributosList() {
        return ATRIBUTOS_WIZARD
      },

      get wizardAtributosCusto() {
        let total = 0
        for (const key of ATRIBUTOS) {
          total += CUSTO_ATRIBUTO[this.wizardAtributos[key]] || 0
        }
        return total
      },

      get wizardPontosRestantes() {
        return PONTOS_CUSTO_ATRIBUTO - this.wizardAtributosCusto
      },

      get wizardPrecisaEscolherAtributos() {
        const raca = this.wizardRaca
        return !!raca && (Number(raca.atributos_escolha?.quantidade) > 0 || /Três Atributos Diferentes|3 Atributos/i.test(raca.atributos?.descricao_atributos || ""))
      },

      get wizardRacialChoicesCount() {
        return this.wizardPrecisaEscolherAtributos ? Number(this.wizardRaca?.atributos_escolha?.quantidade) || 3 : 0
      },

      wizardRacialAtributoPermitido(key) {
        const attr = ATRIBUTOS_WIZARD.find(a => a.key === key)
        return !!attr && !(this.wizardRaca?.atributos_escolha?.excluidos || []).includes(attr.racaKey)
      },

      wizardModRacial(key) {
        if (!this.wizardRaca) return 0
        const attr = ATRIBUTOS_WIZARD.find(a => a.key === key)
        if (!attr) return 0
        const fixo = this.wizardRaca.atributos?.[attr.racaKey] || 0
        const escolhido = this.wizardPrecisaEscolherAtributos && this.wizardRacialAtributoPermitido(key) && this.wizardRacialChoices.includes(key)
        return fixo + (escolhido ? Number(this.wizardRaca.atributos_escolha?.bonus) || 2 : 0)
      },

      alternarRacialEscolha(key) {
        const max = this.wizardRacialChoicesCount
        if (max === 0 || !this.wizardRacialAtributoPermitido(key)) return
        if (this.wizardRacialChoices.includes(key)) {
          this.wizardRacialChoices = this.wizardRacialChoices.filter(k => k !== key)
        } else if (this.wizardRacialChoices.length < max) {
          this.wizardRacialChoices = [...this.wizardRacialChoices, key]
        }
      },

      wizardValorFinal(key) {
        const base = this.wizardAtributos[key] || 10
        return base + this.wizardModRacial(key)
      },

      wizardModificador(v) {
        return Math.floor((v - 10) / 2)
      },

      get wizardValoresDisponiveis() {
        return VALORES_ATRIBUTO
      },

      wizardTokenBloqueado(v) {
        const custo = CUSTO_ATRIBUTO[v] || 0
        return this.wizardPontosRestantes - custo < 0
      },

      wizardAtribuir(key, valor) {
        const numero = Number(valor)
        if (!Number.isInteger(numero)) return
        const v = Math.max(MIN_ATRIBUTO, Math.min(MAX_ATRIBUTO, numero))
        const valorAntigo = this.wizardAtributos[key] ?? 10
        const custoAntigo = CUSTO_ATRIBUTO[valorAntigo] || 0
        const custoNovo = CUSTO_ATRIBUTO[v] || 0
        if (this.wizardPontosRestantes - (custoNovo - custoAntigo) < 0) return
        this.wizardAtributos[key] = v
      },

      wizardClampAtributo(key) {
        const v = Number(this.wizardAtributos[key])
        if (Number.isNaN(v)) return
        const clamped = Math.max(MIN_ATRIBUTO, Math.min(MAX_ATRIBUTO, v))
        const valorAntigo = this.wizardAtributos[key] ?? 10
        const custoAntigo = CUSTO_ATRIBUTO[valorAntigo] || 0
        const custoNovo = CUSTO_ATRIBUTO[clamped] || 0
        if (this.wizardPontosRestantes - (custoNovo - custoAntigo) < 0) return
        this.wizardAtributos[key] = clamped
      },

      get wizardRacialEscolhaCompleta() {
        return !this.wizardPrecisaEscolherAtributos || this.wizardRacialChoices.length === this.wizardRacialChoicesCount
      },

      get wizardPodeProximo() {
        if (this.wizardStep === 1) return !!this.wizardRaca
        if (this.wizardStep === 2) return this.wizardPontosRestantes === 0 && this.wizardRacialEscolhaCompleta
        if (this.wizardStep === 3) return !!(this.wizardClasse && this.wizardNome.trim())
        return false
      },

      wizardStepReached(n) {
        if (n === 1) return true
        if (n === 2) return !!this.wizardRaca
        if (n === 3) return !!this.wizardRaca && this.wizardPontosRestantes === 0 && this.wizardRacialEscolhaCompleta
        return false
      },

      wizardGoTo(n) {
        if (n < 1 || n > 3) return
        if (n > this.wizardStep && !this.wizardStepReached(n)) return
        this.wizardStep = n
      },

      wizardPodeAumentar(key) {
        const atual = this.wizardAtributos[key]
        return atual < MAX_ATRIBUTO && this.wizardPontosRestantes >= CUSTO_ATRIBUTO[atual + 1] - CUSTO_ATRIBUTO[atual]
      },

      wizardInc(key) {
        if (this.wizardAtributos[key] >= MAX_ATRIBUTO) return
        const novo = this.wizardAtributos[key] + 1
        const custoAntigo = CUSTO_ATRIBUTO[this.wizardAtributos[key]] || 0
        const custoNovo = CUSTO_ATRIBUTO[novo] || 0
        if (this.wizardPontosRestantes - (custoNovo - custoAntigo) < 0) return
        this.wizardAtributos[key] = novo
      },

      wizardDec(key) {
        if (this.wizardAtributos[key] <= MIN_ATRIBUTO) return
        this.wizardAtributos[key] = this.wizardAtributos[key] - 1
      },

      wizardNext() {
        if (!this.wizardPodeProximo) return
        this.wizardStep = Math.min(3, this.wizardStep + 1)
      },

      wizardBack() {
        this.wizardStep = Math.max(1, this.wizardStep - 1)
      },

      async wizardFinalizar() {
        if (this.creatingFicha || !this.wizardPodeProximo) return
        const user = this.$store.auth.user
        if (!user) return
        this.form = buildEmptyForm()
        this.form.nome = this.wizardNome.trim()
        this.form.jogador = this.wizardJogador.trim()
        this.form.raca = this.wizardRaca?.nome || ""
        this.form.classe = this.wizardClasse
        this.form.divindade = this.wizardDivindade
        this.form.origem = this.wizardOrigem
        this.form.atributos = {}
        for (const key of ATRIBUTOS) {
          this.form.atributos[key] = this.wizardValorFinal(key)
        }
        this.form.anotacoes = this.wizardDescricao
        const classeAtual = this.form.classe || 'Guerreiro'
        const { pv, pm } = valoresIniciais(classeAtual, this.form.atributos)
        this.form.pv_max = pv
        this.form.pv_atual = pv
        this.form.pm_max = pm
        this.form.pm_atual = pm
        const deslRaca = this.extrairDeslocamento(this.wizardRaca)
        if (deslRaca != null) this.form.deslocamento = deslRaca
        if (this.wizardRaca?.tamanho) this.form.tamanho = this.wizardRaca.tamanho
        this.selectedCharId = null
        this.nivelAnterior = this.toNum(this.form.nivel, 1)
        this.wizardOpen = false

        const payload = {
          nomePersonagem: this.form.nome,
          nomeJogador: this.form.jogador || user.name,
          raca: limparEmojiRaca(this.form.raca) || 'Humano',
          divindade: this.form.divindade || 'Nenhuma',
          origem: this.form.origem || 'Aventureiro',
          classe: classeAtual,
          nivel: this.toNum(this.form.nivel, 1),
          con: this.toNum(this.form.atributos?.CON, 10),
          des: this.toNum(this.form.atributos?.DES, 10),
          sab: this.toNum(this.form.atributos?.SAB, 10),
          car: this.toNum(this.form.atributos?.CAR, 10),
          for_: this.toNum(this.form.atributos?.FOR, 10),
          int_: this.toNum(this.form.atributos?.INT, 10),
          pvMax: pv,
          pvCurrent: pv,
          pmMax: pm,
          pmCurrent: pm,
          deslocamento: this.toNum(this.form.deslocamento, 9),
          tamanho: this.form.tamanho || 'Médio',
          tibao: this.toNum(this.form.tibares, 0),
          jogadorId: user.id,
          descricao: this.form.anotacoes || '',
          defesa: {
            outros: Number(this.form.defesa_outros) || 0,
            atributo: this.form.defesa_atributo || "DES",
          },
          pericias: this.buildPericiasPayload(),
        }

        this.creatingFicha = true
        try {
          const { data } = await createFicha(payload)
          const idCriada = data?.tormentaFicha?.id
          if (idCriada) {
            await this.adicionarHabilidadesDeRaca(idCriada, this.form.raca)
          }
          await this.carregarFichas()
          const criada = idCriada ? this.fichasApi.find(f => f.id === idCriada) : null
          if (criada) {
            this.abrirFicha(criada)
          } else {
            this.voltarParaLista()
          }
          this.$store.toasts.push("Ficha criada com sucesso!", "success")
        } catch (err) {
          console.error('Erro ao salvar ficha:', err)
          this.$store.toasts.push("Erro ao salvar ficha. Verifique os campos.", "error")
        } finally {
          this.creatingFicha = false
        }
      },

      async adicionarHabilidadesDeRaca(fichaId, nomeRaca) {
        const nome = limparEmojiRaca(nomeRaca).toLowerCase()
        if (!nome) return
        const habs = this.habilidadesData.filter(h => {
          const cl = (h.classe || '').trim()
          if (!cl.toLowerCase().startsWith('raça')) return false
          const interno = cl.slice(cl.indexOf('(') + 1, cl.lastIndexOf(')')).trim().toLowerCase()
          return interno === nome
        })
        for (const hab of habs) {
          try {
            await createHabilidade({
              fichaId,
              nome: hab.nome,
              descricao: hab.descricao,
              classe: hab.classe,
              gastoPe: hab.gastoPe ?? null,
            })
          } catch (err) {
            console.error('Erro ao adicionar habilidade de raça:', err)
          }
        }
      },

      emptyForm() {
        return buildEmptyForm()
      },

      loadCharacters() {
        const user = this.$store.auth.user
        if (!user) return
        this.characters = localDB.getCharacters(user.id)
      },

      loadCharacterIntoForm(c) {
        this.selectedCharId = c.id
        const base = this.emptyForm()
        this.form = Object.assign(base, JSON.parse(JSON.stringify(c)))

        if (!this.form.pericias) this.form.pericias = base.pericias
        for (const p of PERICIAS_DEF) {
          if (!this.form.pericias[p.key]) {
            const oldVal = c.pericias?.[p.nome]
            this.form.pericias[p.key] = {
              treino: oldVal?.treinamento ? oldVal.treinamento * 2 : 0,
              outros: "",
              attr: p.attr,
              customName: p.isCustom ? '' : p.nome,
            }
          }
        }

        this.form.inventario1 = []
        this.form.inventario2 = []

      },

      newCharacter() {
        this.novaFicha()
      },

      selectCharacter(id) {
        const c = this.fichasApi.find(item => item.id === id)
        if (c) {
          this.abrirFicha(c)
        }
      },

      getAttrVal(attr) {
        const val = this.form.atributos?.[attr]
        if (val === undefined || val === null || val === "") return 0
        const n = Number(val)
        if (isNaN(n)) return 0
        return Math.floor((n - 10) / 2)
      },

      formatAttr(attr) {
        const v = this.getAttrVal(attr)
        return v
      },

      attrModDisplay(attr) {
        const v = this.getAttrVal(attr)
        return (v > 0 ? "+" : "") + v
      },

      onNivelChange() {
        let nivel = this.toNum(this.form.nivel, 1)
        nivel = Math.max(1, Math.min(20, nivel))
        this.form.nivel = nivel
        const anterior = this.toNum(this.nivelAnterior, 1)
        if (nivel > anterior) {
          this.aplicarGanhosNivel(anterior, nivel)
        } else if (nivel < anterior) {
          this.aplicarPerdasNivel(nivel, anterior)
        }
        this.nivelAnterior = nivel
      },

      aplicarGanhosNivel(anterior, novo) {
        const classe = (this.form.classe || "").trim().toLowerCase()
        if (!classe) return
        const evol = EVOLUCAO_CLASSES.find(c => c.classe.toLowerCase() === classe)
        if (!evol) return
        const modCon = this.getAttrVal("CON")
        const tabela = evol.tabela_evolucao || []
        let pvGanho = 0
        let pmGanho = 0
        for (let n = anterior + 1; n <= novo; n++) {
          const linha = tabela.find(t => t.nivel === n)
          if (linha) {
            pvGanho += Number(linha.pv_ganho_base) || 0
            pmGanho += Number(linha.pm_ganho_base) || 0
          }
        }
        pvGanho += modCon * (novo - anterior)
        this.form.pv_max = this.toNum(this.form.pv_max, 0) + pvGanho
        this.form.pv_atual = this.toNum(this.form.pv_atual, 0) + pvGanho
        this.form.pm_max = this.toNum(this.form.pm_max, 0) + pmGanho
        this.form.pm_atual = this.toNum(this.form.pm_atual, 0) + pmGanho
        this.$store.toasts.push(`Nível ${anterior} → ${novo}: +${pvGanho} PV, +${pmGanho} PM`, "success")
      },

      aplicarPerdasNivel(baixo, alto) {
        const classe = (this.form.classe || "").trim().toLowerCase()
        if (!classe) return
        const evol = EVOLUCAO_CLASSES.find(c => c.classe.toLowerCase() === classe)
        if (!evol) return
        const modCon = this.getAttrVal("CON")
        const tabela = evol.tabela_evolucao || []
        let pvPerda = 0
        let pmPerda = 0
        for (let n = baixo + 1; n <= alto; n++) {
          const linha = tabela.find(t => t.nivel === n)
          if (linha) {
            pvPerda += Number(linha.pv_ganho_base) || 0
            pmPerda += Number(linha.pm_ganho_base) || 0
          }
        }
        pvPerda += modCon * (alto - baixo)
        this.form.pv_max = Math.max(1, this.toNum(this.form.pv_max, 0) - pvPerda)
        this.form.pv_atual = Math.max(0, this.toNum(this.form.pv_atual, 0) - pvPerda)
        this.form.pm_max = Math.max(1, this.toNum(this.form.pm_max, 0) - pmPerda)
        this.form.pm_atual = Math.max(0, this.toNum(this.form.pm_atual, 0) - pmPerda)
        this.$store.toasts.push(`Nível ${alto} → ${baixo}: −${pvPerda} PV, −${pmPerda} PM`, "info")
      },

      toggleEditAtributos() {
        this.editAtributos = !this.editAtributos
        if (!this.editAtributos) {
          for (const attr of ATRIBUTOS) {
            const v = this.form.atributos?.[attr]
            if (v === undefined || v === null || v === "") {
              this.form.atributos[attr] = 10
            }
          }
        }
      },

      calcHalfLevel() {
        const nv = Number(this.form.nivel) || 1
        return Math.floor(nv / 2)
      },

      calcPenalidadeArmadura() {
        const p1 = Math.abs(Number(this.form.armadura_penalidade) || 0)
        const p2 = Math.abs(Number(this.form.escudo_penalidade) || 0)
        let prot = 0
        if (Array.isArray(this.protecoesEquipadas)) {
          for (const p of this.protecoesEquipadas) {
            prot += Math.abs(Number(p.penalidade) || 0)
          }
        }
        return p1 + p2 + prot
      },

      calcPericiaTotal(p) {
        const half = this.calcHalfLevel()
        const attrs = ["FOR", "DES", "CON", "INT", "SAB", "CAR"]
        const periciaData = this.form.pericias?.[p.key] || {}
        const attr = attrs.includes(periciaData.attr) ? periciaData.attr : p.attr
        const attrVal = this.getAttrVal(attr)
        const treino = Number(periciaData.treino) || 0
        const outros = Number(periciaData.outros) || 0
        const pen = p.penalidade ? this.calcPenalidadeArmadura() : 0
        const sobrecarga = ["acrobacia", "furtividade", "ladinagem"].includes(p.key) && this.isSobrecarregado() ? 2 : 0
        return half + attrVal + treino + outros - pen - sobrecarga
      },

      buildPericiasPayload() {
        const half = this.calcHalfLevel()
        const attrs = ["FOR", "DES", "CON", "INT", "SAB", "CAR"]
        const pericias = []
        for (const p of PERICIAS_DEF) {
          const periciaData = this.form.pericias?.[p.key] || {}
          pericias.push({
            nome: p.isCustom && periciaData.customName
              ? `Ofício (${periciaData.customName})`
              : p.nome,
            atributo: attrs.includes(periciaData.attr) ? periciaData.attr : p.attr,
            metadeDoNivel: half,
            treino: Number(periciaData.treino) || 0,
            outros: Number(periciaData.outros) || 0,
          })
        }
        return pericias
      },

      async loadPericiasFicha(fichaId) {
        if (!fichaId) return
        const loadVersion = this.fichaLoadVersion
        try {
          const { data } = await getPericiasByFicha(fichaId)
          if (loadVersion !== this.fichaLoadVersion) return
          const list = Array.isArray(data?.pericias) ? data.pericias : []
          const rest = [...list]
          for (const p of PERICIAS_DEF) {
            const periciaData = this.form.pericias?.[p.key]
            if (!periciaData) continue
            const idx = rest.findIndex(item => {
              if (p.isCustom) return String(item.nome || "").startsWith("Ofício")
              return item.nome === p.nome
            })
            if (idx === -1) continue
            const match = rest.splice(idx, 1)[0]
            periciaData.id = match.id
            periciaData.treino = Number(match.treino) || 0
            periciaData.outros = Number(match.outros) || 0
            periciaData.attr = match.atributo || periciaData.attr
            if (p.isCustom) {
              const m = String(match.nome || "").match(/^Ofício\s*\((.*)\)$/)
              if (m) periciaData.customName = m[1]
            }
          }
        } catch (err) {
          if (loadVersion !== this.fichaLoadVersion) return
          console.error("Erro ao carregar perícias:", err)
        }
      },

      async updatePericiasFicha() {
        if (!this.selectedCharId) return
        const attrs = ["FOR", "DES", "CON", "INT", "SAB", "CAR"]
        const updates = []
        for (const p of PERICIAS_DEF) {
          const periciaData = this.form.pericias?.[p.key]
          if (!periciaData?.id) continue
          updates.push(updatePericia(periciaData.id, {
            nome: p.isCustom && periciaData.customName
              ? `Ofício (${periciaData.customName})`
              : p.nome,
            atributo: attrs.includes(periciaData.attr) ? periciaData.attr : p.attr,
            metadeDoNivel: this.calcHalfLevel(),
            treino: Number(periciaData.treino) || 0,
            outros: Number(periciaData.outros) || 0,
          }))
        }
        await Promise.all(updates)
      },

      async loadHistoricoFicha(fichaId) {
        if (!fichaId) return
        const loadVersion = this.fichaLoadVersion
        try {
          const { data } = await getHistoricoByFicha(fichaId)
          if (loadVersion !== this.fichaLoadVersion) return
          const items = data?.historico || data?.data || data || []
          this.historicoCarregado = Array.isArray(items) ? items.slice().reverse() : []
        } catch (err) {
          if (loadVersion !== this.fichaLoadVersion) return
          console.error('Erro ao carregar histórico:', err)
          this.historicoCarregado = []
        }
      },

      async limparHistoricoFicha() {
        if (!this.selectedCharId && !this.historicoCarregado.length) return
        if (!confirm("Tem certeza que deseja limpar todo o histórico?")) return
        try {
          await Promise.all(this.historicoCarregado.map(h => deleteHistorico(h.id)))
          this.historicoCarregado = []
          this.$store.toasts.push("Histórico limpo.", "success")
        } catch (err) {
          console.error('Erro ao limpar histórico:', err)
          this.$store.toasts.push("Erro ao limpar o histórico.", "error")
        }
      },

      splitHistoricoValue(value) {
        const s = String(value || "")
        const idx = s.indexOf(", Dano:")
        if (idx === -1) return s
        return `${s.slice(0, idx)} — Dano:${s.slice(idx + 7)}`
      },

      historicoTitulo(value) {
        const s = String(value || "")
        const idx = s.indexOf(": ")
        const comma = s.indexOf(",")
        return idx !== -1 && (comma === -1 || idx < comma) ? s.slice(0, idx) : "Rolagem"
      },

      historicoDetalhe(value) {
        const s = String(value || "")
        const idx = s.indexOf(": ")
        const comma = s.indexOf(",")
        return idx !== -1 && (comma === -1 || idx < comma) ? s.slice(idx + 2) : s
      },

      historicoTemCritico(value) {
        return String(value || "").includes("D20 natural: 20")
      },

      async salvarDescricao() {
        if (!this.selectedCharId) return
        try {
          const user = this.$store.auth.user
          await updateFicha(this.selectedCharId, {
            nomePersonagem: this.form.nome || "Personagem sem Nome",
            nomeJogador: this.form.jogador || user?.name || "Jogador",
            raca: limparEmojiRaca(this.form.raca) || "Humano",
            divindade: this.form.divindade || "Nenhuma",
            origem: this.form.origem || "Aventureiro",
            classe: this.form.classe || "Guerreiro",
            nivel: this.toNum(this.form.nivel, 1),
            for_: this.toNum(this.form.atributos?.FOR, 10),
            con: this.toNum(this.form.atributos?.CON, 10),
            des: this.toNum(this.form.atributos?.DES, 10),
            int_: this.toNum(this.form.atributos?.INT, 10),
            sab: this.toNum(this.form.atributos?.SAB, 10),
            car: this.toNum(this.form.atributos?.CAR, 10),
            pvMax: this.toNum(this.form.pv_max, 20),
            pvCurrent: this.toNum(this.form.pv_atual, 20),
            pmMax: this.toNum(this.form.pm_max, 5),
            pmCurrent: this.toNum(this.form.pm_atual, 5),
            deslocamento: this.toNum(this.form.deslocamento, 9),
            jogadorId: user?.id,
            descricao: this.form.anotacoes || '',
          })
          this.$store.toasts.push("Descrição salva com sucesso!", "success")
        } catch (err) {
          console.error('Erro ao salvar descrição:', err)
          this.$store.toasts.push("Erro ao salvar a descrição.", "error")
        }
      },

      extrairDeslocamento(raca) {
        if (!raca) return null
        const texto = String(raca.deslocamento || "").trim()
        if (!texto) return null
        const match = texto.match(/-?\d+(\.\d+)?/)
        if (!match) return null
        const n = Number(match[0])
        return isNaN(n) ? null : n
      },

      aplicarDeslocamentoPorRaca(nomeRaca) {
        const raca = racaDataPorNome(nomeRaca)
        const desl = this.extrairDeslocamento(raca)
        if (desl != null) this.form.deslocamento = desl
        if (raca?.tamanho) this.form.tamanho = raca.tamanho
      },

      aplicarStatusPorClasse(classe) {
        if (this.toNum(this.form.nivel, 1) !== 1) return
        const { pv, pm } = valoresIniciais(classe || "Guerreiro", this.form.atributos)
        this.form.pv_max = pv
        this.form.pv_atual = pv
        this.form.pm_max = pm
        this.form.pm_atual = pm
      },

      normalizeDefesaAtributo(val) {
        const s = String(val || "").trim().toUpperCase()
        if (["FORÇA", "FORCA", "FOR"].includes(s)) return "FOR"
        if (["DESTREZA", "DES"].includes(s)) return "DES"
        if (["CONSTITUIÇÃO", "CONSTITUICAO", "CON"].includes(s)) return "CON"
        if (["INTELIGÊNCIA", "INTELIGENCIA", "INT"].includes(s)) return "INT"
        if (["SABEDORIA", "SAB"].includes(s)) return "SAB"
        if (["CARISMA", "CAR"].includes(s)) return "CAR"
        return ""
      },

      calcDefesa() {
        const base = 10
        const attr = this.form.defesa_atributo
        const mod = attr && ATRIBUTOS.includes(attr) ? this.getAttrVal(attr) : 0
        const outros = Number(this.form.defesa_outros) || 0
        const armadura = this.equippedArmaduraBonus()
        const escudo = this.equippedEscudoBonus()
        return base + mod + armadura + escudo + outros
      },

      equippedArmaduraBonus() {
        let total = 0
        if (Array.isArray(this.protecoesEquipadas)) {
          for (const p of this.protecoesEquipadas) {
            if ((p.tipoProtecao || "").toLowerCase() === "escudo") continue
            total += Number(p.bonus) || 0
          }
        }
        return total
      },

      equippedEscudoBonus() {
        let total = 0
        if (Array.isArray(this.protecoesEquipadas)) {
          for (const p of this.protecoesEquipadas) {
            if ((p.tipoProtecao || "").toLowerCase() !== "escudo") continue
            total += Number(p.bonus) || 0
          }
        }
        return total
      },

      defesaDeFicha(ficha) {
        const usaDes = ficha.defesa
          ? String(ficha.defesa.atributos || "").toLowerCase().includes("des")
          : true
        const des = usaDes ? this.toNum(ficha.des, 0) : 0
        const outros = ficha.defesa ? this.toNum(ficha.defesa.outros, 0) : 0
        return 10 + des + outros
      },

      attrRaw(attr) {
        const val = this.form.atributos?.[attr]
        if (val === undefined || val === null || val === "") return 0
        const n = Number(val)
        if (isNaN(n)) return 0
        return n
      },

      calcCargaMaxima() {
        const forca = Math.max(0, this.attrRaw("FOR"))
        return 10 * forca
      },

      calcCargaNormal() {
        const forca = Math.max(0, this.attrRaw("FOR"))
        return 3 * forca
      },

      isSobrecarregado() {
        const normal = this.calcCargaNormal()
        const usada = this.calcCargaUsada()
        return usada > normal
      },

      cargaExcedeMaximo(peso) {
        const max = this.calcCargaMaxima()
        const novo = this.calcCargaUsada() + (Number(peso) || 0)
        return novo > max
      },

      calcCargaUsada() {
        let total = 0
        if (Array.isArray(this.armasCarregadas)) {
          for (const arma of this.armasCarregadas) {
            if (arma && arma.peso) {
              const p = Number(arma.peso)
              if (!isNaN(p)) total += p
            }
          }
        }
        if (Array.isArray(this.protecoesCarregadas)) {
          for (const prot of this.protecoesCarregadas) {
            if (prot && prot.peso) {
              const p = Number(prot.peso)
              if (!isNaN(p)) total += p
            }
          }
        }
        if (Array.isArray(this.equipamentosCarregados)) {
          for (const eq of this.equipamentosCarregados) {
            if (eq && eq.peso) {
              const p = Number(eq.peso)
              if (!isNaN(p)) total += p
            }
          }
        }
        return total
      },

      clearAutoSaveTimer() {
        if (this.autoSaveTimer) {
          clearTimeout(this.autoSaveTimer)
          this.autoSaveTimer = null
        }
      },

      scheduleAutoSave() {
        if (this.leavingFicha || this.autoSaveSuspended || this.viewMode !== "edit" || !this.selectedCharId) return
        this.clearAutoSaveTimer()
        this.autoSaveState = "editando"
        this.autoSaveTimer = setTimeout(() => {
          this.autoSaveTimer = null
          this.performAutoSave()
        }, 1500)
      },

      performAutoSave() {
        if (this.autoSaveInFlight) {
          this.autoSaveQueued = true
          return this.autoSavePromise
        }
        this.autoSaveInFlight = true
        this.autoSaveState = "salvando"
        this.autoSavePromise = this.runAutoSave()
        return this.autoSavePromise
      },

      async runAutoSave() {
        try {
          const saved = await this.save({ silent: true, stay: true })
          if (saved) {
            this.autoSaveState = "salvo"
            setTimeout(() => {
              if (this.autoSaveState === "salvo") this.autoSaveState = ""
            }, 1800)
          }
          return saved
        } finally {
          this.autoSaveInFlight = false
          this.autoSavePromise = null
          if (this.autoSaveQueued) {
            this.autoSaveQueued = false
            this.scheduleAutoSave()
          }
        }
      },

      openSectionMenu() {
        this.sectionMenuOpen = !this.sectionMenuOpen
      },

      openFichaSection(tab, options = {}) {
        const { updateRoute = true } = options
        if (!this.fichaSections.some(s => s.key === tab)) return
        this.closeEquipPopup()
        this.closeMagiasPopup()
        this.closeHabilidadesPopup()
        this.closeCriarPopup()
        this.activeTab = tab
        this.sectionOpen = true
        this.sectionMenuOpen = false
        if (updateRoute && this.selectedCharId) this.navigateCharacterRoute(tab)
      },

      closeFichaSection() {
        this.sectionOpen = false
        this.sectionMenuOpen = false
      },

      async save(options = {}) {
        const { silent = false, stay = false } = options
        if (!this.form.nome?.trim()) {
          this.form.nome = "Personagem sem Nome"
        }
        const user = this.$store.auth.user
        if (!user) return

        const basePayload = {
          nomePersonagem: this.form.nome,
          nomeJogador: this.form.jogador || user.name,
          raca: limparEmojiRaca(this.form.raca) || 'Humano',
          divindade: this.form.divindade || 'Nenhuma',
          origem: this.form.origem || 'Aventureiro',
          classe: this.form.classe || 'Guerreiro',
          nivel: this.toNum(this.form.nivel, 1),
          con: this.toNum(this.form.atributos?.CON, 10),
          des: this.toNum(this.form.atributos?.DES, 10),
          sab: this.toNum(this.form.atributos?.SAB, 10),
          car: this.toNum(this.form.atributos?.CAR, 10),
          pvMax: this.toNum(this.form.pv_max, 20),
          pvCurrent: this.toNum(this.form.pv_atual, 20),
          pmMax: this.toNum(this.form.pm_max, 5),
          pmCurrent: this.toNum(this.form.pm_atual, 5),
          deslocamento: this.toNum(this.form.deslocamento, 9),
          tamanho: this.form.tamanho || 'Médio',
          descricao: this.form.anotacoes || '',
        }
        const criarPayload = {
          ...basePayload,
          for_: this.toNum(this.form.atributos?.FOR, 10),
          int_: this.toNum(this.form.atributos?.INT, 10),
          tibao: this.toNum(this.form.tibares, 0),
          jogadorId: user.id,
          defesa: {
            outros: Number(this.form.defesa_outros) || 0,
            atributo: this.form.defesa_atributo || "DES",
          },
          pericias: this.buildPericiasPayload(),
        }
        const editarPayload = {
          ...basePayload,
          for_: this.toNum(this.form.atributos?.FOR, 10),
          int_: this.toNum(this.form.atributos?.INT, 10),
          tibao: this.toNum(this.form.tibares, 0),
          jogadorId: user.id,
          defesaId: this.form.defesaId ?? null,
          defesa: {
            outros: Number(this.form.defesa_outros) || 0,
            atributo: this.form.defesa_atributo || "DES",
            atributos: this.form.defesa_atributo || "DES",
          },
        }

        try {
          if (this.selectedCharId) {
            await updateFicha(this.selectedCharId, editarPayload)
            await this.updatePericiasFicha()
            if (!silent) this.$store.toasts.push("Ficha atualizada com sucesso!", "success")
          } else {
            await createFicha(criarPayload)
            if (!silent) this.$store.toasts.push("Ficha criada com sucesso!", "success")
          }
          this.saveFeedback = true
          setTimeout(() => { this.saveFeedback = false }, 2000)
          await this.carregarFichas()
          if (!stay) this.viewMode = 'list'
          return true
        } catch (err) {
          console.error('Erro ao salvar ficha:', err)
          this.autoSaveState = "erro"
          if (!silent) this.$store.toasts.push("Erro ao salvar ficha. Verifique os campos.", "error")
          return false
        }
      },

      toNum(v, fallback) {
        if (v === "" || v === null || v === undefined) return fallback
        const n = Number(v)
        return isNaN(n) ? fallback : n
      },

      async deleteCharacter() {
        if (!this.selectedCharId) return
        await this.deleteFichaCard({ id: this.selectedCharId, nomePersonagem: this.form.nome, sistema: this.currentFichaSystem })
      },

      async deleteFichaCard(ficha) {
        if (!ficha?.id || this.deletingFicha) return
        const nome = ficha.nomePersonagem || "esta ficha"
        const sistema = ficha.sistema || "tormenta"
        if (!confirm(`Tem certeza que deseja excluir ${nome}?`)) return
        this.deletingFicha = true
        try {
          await deleteFicha(ficha.id, sistema)
          if (sistema === "geral") {
            try { localStorage.removeItem(`grimorio_general_ficha_${ficha.id}`) } catch {}
          }
          this.$store.toasts.push("Ficha excluída.", "success")
          if (String(this.selectedCharId) === String(ficha.id) && this.currentFichaSystem === sistema) this.voltarParaLista()
          await this.carregarFichas()
        } catch (err) {
          console.error("Erro ao excluir ficha:", err)
          this.$store.toasts.push("Erro ao excluir a ficha. Tente novamente.", "error")
        } finally {
          this.deletingFicha = false
        }
      },

      resetForm() {
        if (!confirm("Deseja resetar os campos da ficha atual?")) return
        const curId = this.selectedCharId
        this.form = this.emptyForm()
        this.nivelAnterior = this.toNum(this.form.nivel, 1)
        this.selectedCharId = curId
        if (curId) this.form.id = curId
      },

      rollPericia(p) {
        const total = this.calcPericiaTotal(p)
        const name = p.isCustom && this.form.pericias?.[p.key]?.customName
          ? `Ofício (${this.form.pericias[p.key].customName})`
          : p.nome
        const sign = total >= 0 ? `+${total}` : `${total}`
        window.dispatchEvent(new CustomEvent("roll-dice", {
          detail: { formula: `1D20${sign}`, label: `Teste de ${name}`, fichaId: this.selectedCharId }
        }))
      },

      rollAttr(attr) {
        const val = this.getAttrVal(attr)
        const sign = val >= 0 ? `+${val}` : `${val}`
        window.dispatchEvent(new CustomEvent("roll-dice", {
          detail: { formula: `1D20${sign}`, label: `Teste de ${attr}`, fichaId: this.selectedCharId }
        }))
      },

      openEquipPopup() {
        this.showEquipPopup = true
        this.armasSearchTerm = ""
        this.expandedArmaIndex = null
        this.protecoesSearchTerm = ""
        this.expandedProtecaoIndex = null
        this.equipamentosSearchTerm = ""
        this.expandedEquipamentoIndex = null
        this.protecaoTipoTab = "todas"
        this.activeEquipTab = "armas"
      },

      closeEquipPopup() {
        this.showEquipPopup = false
      },

      openCriarPopup(tipo) {
        this.criarTipo = tipo
        this.criarTipoSelector = tipo === "equipamento"
        this.editArmaMode = false
        this.editArmaId = null
        this.editProtecaoMode = false
        this.editProtecaoId = null
        this.editEquipamentoMode = false
        this.editEquipamentoId = null
        this.editMagiaMode = false
        this.editMagiaId = null
        this.editHabilidadeMode = false
        this.editHabilidadeId = null
        if (tipo === "arma" || tipo === "equipamento") {
          this.novaArmaForm = { nome: "", preco: 0, dadoDeDano: "1d4", alcance: "Curto", peso: 0, tipoDano: "—", tipoArma: "Arma Simples", critico: 20, multiplicador: 2, atributo: "FOR", pericia: "Luta", descricao: "" }
          if (tipo === "equipamento") this.criarTipo = "arma"
        } else if (tipo === "magia") {
          this.novaMagiaForm = { nome: "", tipoMagia: "Arcana", Circulo: "1º Círculo", execucao: "padrão", alcance: "curto", alvo: "", duracao: "cena", gastoPe: 1, truque: "", descricao: "" }
        } else if (tipo === "habilidade") {
          this.novaHabilidadeForm = { nome: "", classe: "Geral", gastoPe: null, descricao: "" }
        } else if (tipo === "protecao") {
          this.novaProtecaoForm = { nome: "", preco: 0, bonus: 0, penalidade: 0, peso: 0, tipoProtecao: "Leve", descricao: "" }
        } else if (tipo === "item") {
          this.novaEquipamentoForm = { nome: "", peso: 0, descricao: "" }
        }
        this.showCriarPopup = true
      },

      setCriarEquipTipo(t) {
        if (t !== "arma" && t !== "protecao" && t !== "item") return
        this.criarTipo = t
        if (t === "arma") {
          this.novaArmaForm = { nome: "", preco: 0, dadoDeDano: "1d4", alcance: "Curto", peso: 0, tipoDano: "—", tipoArma: "Arma Simples", critico: 20, multiplicador: 2, atributo: "FOR", pericia: "Luta", descricao: "" }
        } else if (t === "protecao") {
          this.novaProtecaoForm = { nome: "", preco: 0, bonus: 0, penalidade: 0, peso: 0, tipoProtecao: "Leve", descricao: "" }
        } else {
          this.novaEquipamentoForm = { nome: "", peso: 0, descricao: "" }
        }
      },

      closeCriarPopup() {
        this.showCriarPopup = false
        this.editArmaMode = false
        this.editArmaId = null
        this.editProtecaoMode = false
        this.editProtecaoId = null
        this.editEquipamentoMode = false
        this.editEquipamentoId = null
        this.editMagiaMode = false
        this.editMagiaId = null
        this.editHabilidadeMode = false
        this.editHabilidadeId = null
        this.criarTipoSelector = false
      },

      editarArma(arma) {
        this.editArmaMode = true
        this.editArmaId = arma.id
        this.criarTipo = "arma"
        this.criarTipoSelector = false
        this.novaArmaForm = {
          nome: arma.nome || "",
          preco: arma.preco || 0,
          dadoDeDano: arma.dadoDeDano || "1d4",
          alcance: arma.alcance || "—",
          peso: arma.peso || 0,
          tipoDano: arma.tipoDano || "—",
          tipoArma: arma.tipoArma || "Arma Simples",
          critico: arma.critico || 20,
          multiplicador: Number(String(arma.multiplicador || "2").replace("x", "").trim()) || 2,
          atributo: arma.atributo || "FOR",
          pericia: arma.pericia || "Luta",
          descricao: arma.descricao || "",
        }
        this.showCriarPopup = true
      },

      editarProtecao(p) {
        this.editProtecaoMode = true
        this.editProtecaoId = p.id
        this.criarTipo = "protecao"
        this.criarTipoSelector = false
        this.novaProtecaoForm = {
          nome: p.nomeProtecao || "",
          preco: p.preco || 0,
          bonus: p.bonus || 0,
          penalidade: p.penalidade || 0,
          peso: p.peso || 0,
          tipoProtecao: p.tipoProtecao || "Leve",
          descricao: p.descricao || "",
        }
        this.showCriarPopup = true
      },

      editarEquipamento(eq) {
        this.editEquipamentoMode = true
        this.editEquipamentoId = eq.id
        this.criarTipo = "item"
        this.criarTipoSelector = false
        this.novaEquipamentoForm = {
          nome: eq.nome || "",
          peso: eq.peso || 0,
          descricao: eq.descricao || "",
        }
        this.showCriarPopup = true
      },

      editarMagia(magia) {
        this.editMagiaMode = true
        this.editMagiaId = magia.id
        this.criarTipo = "magia"
        this.criarTipoSelector = false
        this.novaMagiaForm = {
          nome: magia.nome || "",
          tipoMagia: magia.tipoMagia || "Arcana",
          Circulo: magia.Circulo || "1º Círculo",
          execucao: magia.execucao || "padrão",
          alcance: magia.alcance || "curto",
          alvo: magia.alvo || "",
          duracao: magia.duracao || "cena",
          gastoPe: magia.gastoPe ?? 1,
          truque: magia.truque || "",
          descricao: magia.descricao || "",
        }
        this.showCriarPopup = true
      },

      editarHabilidade(hab) {
        this.editHabilidadeMode = true
        this.editHabilidadeId = hab.id
        this.criarTipo = "habilidade"
        this.criarTipoSelector = false
        this.novaHabilidadeForm = {
          nome: hab.nome || "",
          classe: hab.classe || "Geral",
          gastoPe: hab.gastoPe ?? null,
          descricao: hab.descricao || "",
        }
        this.showCriarPopup = true
      },

      async criarItem() {
        if (!this.selectedCharId) {
          this.$store.toasts.push("Salve a ficha primeiro para adicionar itens.", "error")
          return
        }
        try {
          if (this.criarTipo === "arma") {
            const f = this.novaArmaForm
            if (!f.nome.trim()) {
              this.$store.toasts.push("Dê um nome para o item.", "error")
              return
            }
            if (!this.editArmaMode && this.cargaExcedeMaximo(f.peso)) {
              this.$store.toasts.push("Peso excede o limite de carga (10x FOR).", "error")
              return
            }
            const isRanged = !["corpo a corpo", "—", ""].includes(String(f.alcance || "").trim().toLowerCase())
            const attr = f.atributo || (isRanged ? "DES" : "FOR")
            const per = f.pericia || (isRanged ? "Pontaria" : "Luta")
            if (this.editArmaMode && this.editArmaId) {
              await updateArma(this.editArmaId, {
                nome: f.nome.trim(),
                preco: Number(f.preco) || 0,
                dadoDeDano: f.dadoDeDano || "1d4",
                alcance: f.alcance || "—",
                peso: Number(f.peso) || 0,
                tipoDano: f.tipoDano || "—",
                tipoArma: f.tipoArma || "Arma Simples",
                critico: Number(f.critico) || 20,
                multiplicador: Number(String(f.multiplicador || "2").replace("x", "").trim()) || 2,
                atributo: attr,
                pericia: per,
                descricao: f.descricao || "",
              })
              this.$store.toasts.push(`${f.nome} editada com sucesso!`, "success")
            } else {
              await createArma({
                fichaId: this.selectedCharId,
                nome: f.nome.trim(),
                preco: Number(f.preco) || 0,
                dadoDeDano: f.dadoDeDano || "1d4",
                alcance: f.alcance || "—",
                peso: Number(f.peso) || 0,
                tipoDano: f.tipoDano || "—",
                tipoArma: f.tipoArma || "Arma Simples",
                critico: Number(f.critico) || 20,
                multiplicador: Number(String(f.multiplicador || "2").replace("x", "").trim()) || 2,
                atributo: attr,
                pericia: per,
                descricao: f.descricao || "",
              })
              this.$store.toasts.push(`${f.nome} criado(a) e adicionado(a) ao inventário!`, "success")
            }
            await this.loadArmasFicha()
          } else if (this.criarTipo === "magia") {
            const f = this.novaMagiaForm
            if (!f.nome.trim()) {
              this.$store.toasts.push("Dê um nome para a magia.", "error")
              return
            }
            if (this.editMagiaMode && this.editMagiaId) {
              await updateMagia(this.editMagiaId, this.selectedCharId, {
                nome: f.nome.trim(),
                tipoMagia: f.tipoMagia || "Arcana",
                Circulo: f.Circulo || "1º Círculo",
                execucao: f.execucao || "padrão",
                alcance: f.alcance || "",
                alvo: f.alvo || "",
                duracao: f.duracao || "",
                gastoPe: Number(f.gastoPe) || 0,
                truque: f.truque || "",
                descricao: f.descricao || "",
              })
              this.$store.toasts.push(`${f.nome} editada com sucesso!`, "success")
            } else {
              await createMagia({
                fichaId: this.selectedCharId,
                nome: f.nome.trim(),
                tipoMagia: f.tipoMagia || "Arcana",
                Circulo: f.Circulo || "1º Círculo",
                execucao: f.execucao || "padrão",
                alcance: f.alcance || "",
                alvo: f.alvo || "",
                duracao: f.duracao || "",
                gastoPe: Number(f.gastoPe) || 0,
                truque: f.truque || "",
                descricao: f.descricao || "",
              })
              this.$store.toasts.push(`${f.nome} criada e adicionada à ficha!`, "success")
            }
            await this.loadMagiasFicha()
          } else if (this.criarTipo === "habilidade") {
            const f = this.novaHabilidadeForm
            if (!f.nome.trim()) {
              this.$store.toasts.push("Dê um nome para a habilidade.", "error")
              return
            }
            if (this.editHabilidadeMode && this.editHabilidadeId) {
              await updateHabilidade(this.editHabilidadeId, {
                nome: f.nome.trim(),
                classe: f.classe || "Geral",
                gastoPe: f.gastoPe !== "" && f.gastoPe !== null ? Number(f.gastoPe) : null,
                descricao: f.descricao || "",
              })
              this.$store.toasts.push(`${f.nome} editada com sucesso!`, "success")
            } else {
              await createHabilidade({
                fichaId: this.selectedCharId,
                nome: f.nome.trim(),
                classe: f.classe || "Geral",
                gastoPe: f.gastoPe !== "" && f.gastoPe !== null ? Number(f.gastoPe) : null,
                descricao: f.descricao || "",
              })
              this.$store.toasts.push(`${f.nome} criada e adicionada à ficha!`, "success")
            }
            await this.loadHabilidadesFicha()
          } else if (this.criarTipo === "protecao") {
            const f = this.novaProtecaoForm
            if (!f.nome.trim()) {
              this.$store.toasts.push("Dê um nome para a proteção.", "error")
              return
            }
            if (!this.editProtecaoMode && this.cargaExcedeMaximo(f.peso)) {
              this.$store.toasts.push("Peso excede o limite de carga (10x FOR).", "error")
              return
            }
            if (this.editProtecaoMode && this.editProtecaoId) {
              await updateProtecao(this.editProtecaoId, {
                nomeProtecao: f.nome.trim(),
                preco: Number(f.preco) || 0,
                bonus: Number(f.bonus) || 0,
                penalidade: Number(f.penalidade) || 0,
                peso: Number(f.peso) || 0,
                tipoProtecao: f.tipoProtecao || "Leve",
                descricao: f.descricao || "",
              })
              this.$store.toasts.push(`${f.nome} editada com sucesso!`, "success")
            } else {
              await createProtecao({
                fichaId: this.selectedCharId,
                nomeProtecao: f.nome.trim(),
                preco: Number(f.preco) || 0,
                bonus: Number(f.bonus) || 0,
                penalidade: Number(f.penalidade) || 0,
                peso: Number(f.peso) || 0,
                tipoProtecao: f.tipoProtecao || "Leve",
                descricao: f.descricao || "",
              })
              this.$store.toasts.push(`${f.nome} criada e adicionada à ficha!`, "success")
            }
            await this.loadProtecoesFicha()
          } else if (this.criarTipo === "item") {
            const f = this.novaEquipamentoForm
            if (!f.nome.trim()) {
              this.$store.toasts.push("Dê um nome para o equipamento.", "error")
              return
            }
            if (!this.editEquipamentoMode && this.cargaExcedeMaximo(f.peso)) {
              this.$store.toasts.push("Peso excede o limite de carga (10x FOR).", "error")
              return
            }
            if (this.editEquipamentoMode && this.editEquipamentoId) {
              await updateEquipamento(this.editEquipamentoId, {
                nome: f.nome.trim(),
                peso: Number(f.peso) || 0,
                descricao: f.descricao || "",
              })
              this.$store.toasts.push(`${f.nome} editado com sucesso!`, "success")
            } else {
              await createEquipamento({
                fichaId: this.selectedCharId,
                nome: f.nome.trim(),
                peso: Number(f.peso) || 0,
                descricao: f.descricao || "",
              })
              this.$store.toasts.push(`${f.nome} criado e adicionado ao inventário!`, "success")
            }
            await this.loadEquipamentosFicha()
          }
          this.closeCriarPopup()
        } catch (err) {
          console.error("Erro ao criar item:", err)
          this.$store.toasts.push("Erro ao criar. Tente novamente.", "error")
        }
      },

      toggleArmaDesc(index) {
        this.expandedArmaIndex = this.expandedArmaIndex === index ? null : index
      },

      async addArmaToInventory(arma) {
        if (!this.selectedCharId) {
          this.$store.toasts.push("Salve a ficha primeiro para adicionar equipamentos.", "error")
          return
        }
        if (this.cargaExcedeMaximo(arma.peso)) {
          this.$store.toasts.push("Peso excede o limite de carga (10x FOR).", "error")
          return
        }
        const isRanged = !["corpo a corpo", "—", ""].includes(String(arma.alcance || "").trim().toLowerCase())
        const atributo = arma.atributo || (isRanged ? "DES" : "FOR")
        const pericia = arma.pericia || (isRanged ? "Pontaria" : "Luta")
        try {
          await createArma({
            fichaId: this.selectedCharId,
            nome: arma.nome,
            preco: arma.preco,
            dadoDeDano: arma.dadoDeDano,
            alcance: arma.alcance,
            peso: arma.peso,
            tipoDano: arma.tipoDano,
            tipoArma: arma.tipoArma,
            critico: arma.critico,
            multiplicador: arma.multiplicador,
            atributo,
            pericia,
            descricao: arma.descricao,
          })
          this.$store.toasts.push(`${arma.nome} adicionada ao inventário!`, "success")
          await this.loadArmasFicha()
        } catch (err) {
          console.error("Erro ao adicionar arma:", err)
          this.$store.toasts.push("Erro ao adicionar arma. Tente novamente.", "error")
        }
      },

      async loadArmasFicha() {
        if (!this.selectedCharId) return
        const loadVersion = this.fichaLoadVersion
        try {
          const { data } = await getArmasByFicha(this.selectedCharId)
          if (loadVersion !== this.fichaLoadVersion) return
          this.armasCarregadas = data?.data || []
        } catch (err) {
          if (loadVersion !== this.fichaLoadVersion) return
          console.error("Erro ao carregar armas:", err)
          this.armasCarregadas = []
        }
      },

      async removeArmaFicha(armaId) {
        try {
          await deleteArma(armaId)
          this.$store.toasts.push("Arma removida do inventário.", "info")
          await this.loadArmasFicha()
        } catch (err) {
          console.error("Erro ao remover arma:", err)
          this.$store.toasts.push("Erro ao remover arma.", "error")
        }
      },

      toggleArmaCarregadaDesc(id) {
        this.expandedArmaCarregadaId = this.expandedArmaCarregadaId === id ? null : id
      },

      async toggleArmaEquiped(arma) {
        const novo = !arma.equiped
        try {
          await updateArma(arma.id, { equiped: novo })
          arma.equiped = novo
          this.$store.toasts.push(novo ? `${arma.nome} equipada.` : `${arma.nome} desequipada.`, "success")
        } catch (err) {
          console.error("Erro ao atualizar arma:", err)
          this.$store.toasts.push("Erro ao atualizar arma.", "error")
        }
      },

      async addProtecaoToFicha(protecao) {
        if (!this.selectedCharId) {
          this.$store.toasts.push("Salve a ficha primeiro para adicionar equipamentos.", "error")
          return
        }
        if (this.cargaExcedeMaximo(protecao.peso)) {
          this.$store.toasts.push("Peso excede o limite de carga (10x FOR).", "error")
          return
        }
        try {
          await createProtecao({
            fichaId: this.selectedCharId,
            nomeProtecao: protecao.nome,
            preco: protecao.preco,
            bonus: protecao.bonusDefesa,
            penalidade: protecao.penalidadeArmadura,
            peso: protecao.peso,
            tipoProtecao: protecao.tipo,
            descricao: protecao.descricao,
          })
          this.$store.toasts.push(`${protecao.nome} adicionada ao inventário!`, "success")
          await this.loadProtecoesFicha()
        } catch (err) {
          console.error("Erro ao adicionar proteção:", err)
          this.$store.toasts.push("Erro ao adicionar proteção. Tente novamente.", "error")
        }
      },

      async loadProtecoesFicha() {
        if (!this.selectedCharId) return
        const loadVersion = this.fichaLoadVersion
        try {
          const { data } = await getProtecoesByFicha(this.selectedCharId)
          if (loadVersion !== this.fichaLoadVersion) return
          this.protecoesCarregadas = data?.data || []
        } catch (err) {
          if (loadVersion !== this.fichaLoadVersion) return
          console.error("Erro ao carregar proteções:", err)
          this.protecoesCarregadas = []
        }
      },

      async removeProtecaoFicha(protecaoId) {
        try {
          await deleteProtecao(protecaoId)
          this.$store.toasts.push("Proteção removida do inventário.", "info")
          await this.loadProtecoesFicha()
        } catch (err) {
          console.error("Erro ao remover proteção:", err)
          this.$store.toasts.push("Erro ao remover proteção.", "error")
        }
      },

      toggleProtecaoDesc(index) {
        this.expandedProtecaoIndex = this.expandedProtecaoIndex === index ? null : index
      },

      toggleProtecaoCarregadaDesc(id) {
        this.expandedProtecaoCarregadaId = this.expandedProtecaoCarregadaId === id ? null : id
      },

      async toggleProtecaoEquipada(protecao) {
        const novo = !protecao.equipada
        try {
          await updateProtecaoEquipada(protecao.id, novo)
          protecao.equipada = novo
          this.$store.toasts.push(novo ? `${protecao.nomeProtecao} equipada.` : `${protecao.nomeProtecao} desequipada.`, "success")
        } catch (err) {
          console.error("Erro ao atualizar proteção:", err)
          this.$store.toasts.push("Erro ao atualizar proteção.", "error")
        }
      },

      async addEquipamentoToFicha(equipamento) {
        if (!this.selectedCharId) {
          this.$store.toasts.push("Salve a ficha primeiro para adicionar equipamentos.", "error")
          return
        }
        if (this.cargaExcedeMaximo(equipamento.peso)) {
          this.$store.toasts.push("Peso excede o limite de carga (10x FOR).", "error")
          return
        }
        try {
          await createEquipamento({
            fichaId: this.selectedCharId,
            nome: equipamento.nome,
            peso: equipamento.peso || 0,
            descricao: equipamento.descricao || "",
          })
          this.$store.toasts.push(`${equipamento.nome} adicionado ao inventário!`, "success")
          await this.loadEquipamentosFicha()
        } catch (err) {
          console.error("Erro ao adicionar equipamento:", err)
          this.$store.toasts.push("Erro ao adicionar equipamento. Tente novamente.", "error")
        }
      },

      async loadEquipamentosFicha() {
        if (!this.selectedCharId) return
        const loadVersion = this.fichaLoadVersion
        try {
          const { data } = await getEquipamentosByFicha(this.selectedCharId)
          if (loadVersion !== this.fichaLoadVersion) return
          this.equipamentosCarregados = data?.data || []
        } catch (err) {
          if (loadVersion !== this.fichaLoadVersion) return
          console.error("Erro ao carregar equipamentos:", err)
          this.equipamentosCarregados = []
        }
      },

      async removeEquipamentoFicha(equipamentoId) {
        try {
          await deleteEquipamento(equipamentoId)
          this.$store.toasts.push("Equipamento removido do inventário.", "info")
          await this.loadEquipamentosFicha()
        } catch (err) {
          console.error("Erro ao remover equipamento:", err)
          this.$store.toasts.push("Erro ao remover equipamento.", "error")
        }
      },

      toggleEquipamentoDesc(index) {
        this.expandedEquipamentoIndex = this.expandedEquipamentoIndex === index ? null : index
      },

      toggleEquipamentoCarregadoDesc(id) {
        this.expandedEquipamentoCarregadoId = this.expandedEquipamentoCarregadoId === id ? null : id
      },

      armaPericiaInfo(arma) {
        const isRanged = !["corpo a corpo", "—", ""].includes(String(arma.alcance || "").trim().toLowerCase())
        const nome = (arma.pericia || "").trim()
        let p = PERICIAS_DEF.find(x => x.nome.toLowerCase() === nome.toLowerCase())
        if (!p) p = PERICIAS_DEF.find(x => x.key === (isRanged ? "pontaria" : "luta"))
        return { p, isRanged }
      },

      armaAtaqueMod(arma) {
        const { p } = this.armaPericiaInfo(arma)
        const periciaData = this.form.pericias?.[p.key] || {}
        const attrVal = this.getAttrVal((arma.atributo || p.attr || "FOR").trim())
        const base = this.calcHalfLevel() +
          (Number(periciaData.treino) || 0) +
          (Number(periciaData.outros) || 0) -
          (p.penalidade ? this.calcPenalidadeArmadura() : 0)
        return attrVal + base
      },

      rolarAtaque(arma) {
        const { p } = this.armaPericiaInfo(arma)
        const mod = this.armaAtaqueMod(arma)
        const danoMod = this.getAttrVal((arma.atributo || p.attr || "FOR").trim())
        window.dispatchEvent(new CustomEvent("roll-ataque", {
          detail: {
            arma,
            label: `Ataque ${arma.nome}`,
            mod,
            danoMod,
            periciaNome: p.nome,
            fichaId: this.selectedCharId,
          }
        }))
      },

      toggleAtaqueArmaExpand(arma) {
        this.expandedAtaqueArmaId = this.expandedAtaqueArmaId === arma.id ? null : arma.id
        if (this.expandedAtaqueArmaId) {
          const { p } = this.armaPericiaInfo(arma)
          if (!arma.atributo) arma.atributo = p.attr || "FOR"
          if (!arma.pericia) arma.pericia = p.nome
        }
      },

      async salvarAtaqueConfig(arma) {
        try {
          await updateArma(arma.id, { equiped: arma.equiped, atributo: arma.atributo, pericia: arma.pericia, critico: arma.critico })
          this.$store.toasts.push(`${arma.nome}: ${arma.atributo || "FOR"} · ${arma.pericia || "Luta"}.`, "success")
        } catch (err) {
          console.error("Erro ao atualizar arma:", err)
          this.$store.toasts.push("Erro ao atualizar configuração de ataque.", "error")
        }
      },

      openMagiasPopup() {
        this.showMagiasPopup = true
        this.magiasSearchTerm = ""
        this.expandedMagiaIndex = null
        this.activeMagiaTipoTab = "todas"
        this.activeMagiaCirculoTab = "todos"
      },

      closeMagiasPopup() {
        this.showMagiasPopup = false
      },

      toggleMagiaDesc(index) {
        this.expandedMagiaIndex = this.expandedMagiaIndex === index ? null : index
      },

      magiaDetalhes(magia) {
        return detalhesMagia(magia)
      },

      async addMagiaToFicha(magia) {
        if (!this.selectedCharId) {
          this.$store.toasts.push("Salve a ficha primeiro para adicionar magias.", "error")
          return
        }
        try {
          await createMagia({
            fichaId: this.selectedCharId,
            nome: magia.nome,
            tipoMagia: magia.tipoMagia,
            Circulo: magia.Circulo,
            execucao: magia.execucao,
            alcance: magia.alcance,
            alvo: magia.alvo,
            duracao: magia.duracao,
            gastoPe: magia.gastoPe,
            truque: magia.truque,
            descricao: serializarDescricaoMagia(magia),
          })
          this.$store.toasts.push(`${magia.nome} adicionada à ficha!`, "success")
          await this.loadMagiasFicha()
        } catch (err) {
          console.error("Erro ao adicionar magia:", err)
          this.$store.toasts.push("Erro ao adicionar magia. Tente novamente.", "error")
        }
      },

      async loadMagiasFicha() {
        if (!this.selectedCharId) return
        const loadVersion = this.fichaLoadVersion
        try {
          const { data } = await getMagiasByFicha(this.selectedCharId)
          if (loadVersion !== this.fichaLoadVersion) return
          this.magiasCarregadas = data?.magias || data?.data || []
        } catch (err) {
          if (loadVersion !== this.fichaLoadVersion) return
          console.error("Erro ao carregar magias:", err)
          this.magiasCarregadas = []
        }
      },

      async removeMagiaFicha(magiaId) {
        try {
          await deleteMagia(magiaId)
          this.$store.toasts.push("Magia removida da ficha.", "info")
          await this.loadMagiasFicha()
        } catch (err) {
          console.error("Erro ao remover magia:", err)
          this.$store.toasts.push("Erro ao remover magia.", "error")
        }
      },

      toggleMagiaCarregadaDesc(id) {
        this.expandedMagiaCarregadaId = this.expandedMagiaCarregadaId === id ? null : id
      },

      openHabilidadesPopup() {
        this.showHabilidadesPopup = true
        this.habilidadesSearchTerm = ""
        this.expandedHabilidadeIndex = null
        this.activeClasseTab = this.habClasses[0] || null
      },

      closeHabilidadesPopup() {
        this.showHabilidadesPopup = false
      },

      toggleHabilidadeDesc(index) {
        this.expandedHabilidadeIndex = this.expandedHabilidadeIndex === index ? null : index
      },

      async addHabilidadeToFicha(hab) {
        if (!this.selectedCharId) {
          this.$store.toasts.push("Salve a ficha primeiro para adicionar habilidades.", "error")
          return
        }
        try {
          await createHabilidade({
            fichaId: this.selectedCharId,
            nome: hab.nome,
            descricao: hab.descricao,
            classe: hab.classe,
            gastoPe: hab.gastoPe ?? null,
          })
          this.$store.toasts.push(`${hab.nome} adicionada à ficha!`, "success")
          await this.loadHabilidadesFicha()
        } catch (err) {
          console.error("Erro ao adicionar habilidade:", err)
          this.$store.toasts.push("Erro ao adicionar habilidade. Tente novamente.", "error")
        }
      },

      async loadHabilidadesFicha() {
        if (!this.selectedCharId) return
        const loadVersion = this.fichaLoadVersion
        try {
          const { data } = await getHabilidadesByFicha(this.selectedCharId)
          if (loadVersion !== this.fichaLoadVersion) return
          this.habilidadesCarregadas = data?.habilidades || data?.data || []
        } catch (err) {
          if (loadVersion !== this.fichaLoadVersion) return
          console.error("Erro ao carregar habilidades:", err)
          this.habilidadesCarregadas = []
        }
      },

      async removeHabilidadeFicha(habId) {
        try {
          await deleteHabilidade(habId)
          this.$store.toasts.push("Habilidade removida da ficha.", "info")
          await this.loadHabilidadesFicha()
        } catch (err) {
          console.error("Erro ao remover habilidade:", err)
          this.$store.toasts.push("Erro ao remover habilidade.", "error")
        }
      },

      toggleHabilidadeCarregadaDesc(id) {
        this.expandedHabilidadeCarregadaId = this.expandedHabilidadeCarregadaId === id ? null : id
      },
    }
  },
}

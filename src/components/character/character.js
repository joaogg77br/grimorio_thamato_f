import { localDB, generateId } from "../../lib/localDB.js"
import { getFichasByUser, createFicha, updateFicha, deleteFicha, createArma, getArmasByFicha, deleteArma, updateArma, createProtecao, getProtecoesByFicha, deleteProtecao, updateProtecaoEquipada, updateProtecao, createEquipamento, getEquipamentosByFicha, deleteEquipamento, updateEquipamento, createMagia, getMagiasByFicha, deleteMagia, updateMagia, createHabilidade, getHabilidadesByFicha, deleteHabilidade, updateHabilidade, getPericiasByFicha, updatePericia, getHistoricoByFicha, deleteHistorico } from "../../useApi/index.js"
import html from "./character.html?raw"
import ARMAS_DATA from "../../data/armas.js"
import PROTECOES_DATA from "../../data/protecoes.js"
import EQUIPAMENTOS_DATA from "../../data/equipamentos.js"
import MAGIAS_DATA from "../../data/magias.js"
import HABILIDADES_DATA from "../../data/habilidades.js"
import EVOLUCAO_CLASSES from "../../data/evolucao.js"
import RACAS_DATA, { limparEmojiRaca, adicionarEmojiRaca } from "../../data/racas.js"
import { valoresIniciais } from "../../data/valores-iniciais.js"

const CLASSES = [
  "Arcanista", "Bárbaro", "Bardo", "Bucaneiro", "Caçador",
  "Cavaleiro", "Clérigo", "Druida", "Feiticeiro", "Guerreiro",
  "Inventor", "Ladino", "Lutador", "Nobre", "Paladino",
]

const ORIGENS = [
  "Acólito", "Amigo dos Animais", "Artesão", "Artista",
  "Assistente de Laboratório", "Aventureiro", "Caçador de Recompensas",
  "Capanga", "Cartógrafo", "Charlatão", "Cozinheiro", "Criado",
  "Curandeiro", "Elegante", "Empregado", "Engenheiro", "Escravo",
  "Escudeiro", "Estudioso", "Fazendeiro", "Ferreiro", "Forasteiro",
  "Gladiador", "Guarda", "Herdeiro", "Herói Camponês", "Jogador",
  "Justiceiro", "Lavrador", "Marinheiro", "Mercador", "Mercenário",
  "Mendigo", "Mensageiro", "Mestre Artesão", "Mestre Ferreiro",
  "Militar", "Mineiro", "Nômade", "Órfão", "Pastor", "Pivete",
  "Político", "Refugiado", "Salteador", "Seguidor", "Selecionado",
  "Soldado", "Taverneiro", "Trambiqueiro",
]

const RACAS = RACAS_DATA.map(r => r.nome)

const racaDataPorNome = (nome) => RACAS_DATA.find(r => limparEmojiRaca(r.nome).toLowerCase() === String(nome || '').trim().toLowerCase())

const DIVINDADES = [
  "Aharadak", "Allihanna", "Arsenal", "Azgher", "Glórienn",
  "Hyninn", "Kallyadranoch", "Khalmyr", "Lena", "Lin-Wu",
  "Marah", "Megalokk", "Nimb", "Oceano", "Sszzaas",
  "Tanna-Toh", "Tenebra", "Thyatis", "Valkaria", "Wynna",
]

const ATRIBUTOS = ["FOR", "DES", "CON", "INT", "SAB", "CAR"]

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
    proficiencias_poderes: "",
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
      loading: false,
      creatingFicha: false,
      historicoCarregado: [],

      characters: [],
      selectedCharId: null,
      saveFeedback: false,
      activeTab: "pericias",
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

      get fichasFiltradas() {
        const term = this.searchTerm.toLowerCase().trim()
        console.log("fichaApi em fichasfiltradas", this.fichasApi)
        if (!term) return this.fichasApi
        return this.fichasApi.filter(f =>
          (f.nomePersonagem || '').toLowerCase().includes(term) ||
          (f.classe || '').toLowerCase().includes(term) ||
          (f.nomeJogador || '').toLowerCase().includes(term) ||
          limparEmojiRaca(f.raca).toLowerCase().includes(term)
        )
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
        await this.carregarFichas()
        this.$watch('$store.auth.user', async (user) => {
          if (user) await this.carregarFichas()
        })
        this.$watch('$store.masterView.ficha', (ficha) => {
          if (ficha) {
            this.abrirFicha(ficha)
            this.$store.masterView.ficha = null
          }
        })
        window.addEventListener("historico-atualizado", (e) => {
          const { fichaId } = e.detail || {}
          if (fichaId && Number(fichaId) === Number(this.selectedCharId)) {
            this.loadHistoricoFicha(fichaId)
          }
        })
      },

      async carregarFichas() {
        const user = this.$store.auth.user
        if (!user) return
        this.loading = true
        try {
          const { data } = await getFichasByUser(user.id)
          console.log('API response:', JSON.stringify(data))
          console.log("fichas Filtradas em carregar Fichas", this.fichasApi, data?.data)
          this.fichasApi = data?.data || []
        } catch (err) {
          console.error('Erro ao carregar fichas:', err)
          this.fichasApi = []
          this.$store.toasts.push("Erro ao carregar fichas.", "error")
        } finally {
          this.loading = false
        }
      },

      abrirFicha(ficha) {
        this.selectedCharId = ficha.id
        this.form = {
          id: ficha.id,
          nome: ficha.nomePersonagem || '',
          jogador: ficha.nomeJogador || '',
          raca: adicionarEmojiRaca(ficha.raca) || '',
          origem: ficha.origem || '',
          classe: ficha.classe || '',
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
          tamanho: 'Médio',
          tamanho_mod: '0 / 0',
          deslocamento: ficha.deslocamento || 9,
          xp_atual: 0,
          xp_max: 1000,
          pericias: this.buildPericiasFromFicha(ficha),
          proficiencias_poderes: '',
          inventario1: [],
          inventario2: [],
          tibares: this.toNum(ficha.tibao, this.toNum(ficha.tibares, 0)),
          anotacoes: ficha.descricao || '',
        }
        this.activeTab = 'pericias'
        this.viewMode = 'edit'
        this.nivelAnterior = this.toNum(ficha.nivel, 1)
        this.expandedArmaCarregadaId = null
        this.expandedMagiaCarregadaId = null
        this.expandedHabilidadeCarregadaId = null
        this.expandedAtaqueArmaId = null
        this.loadArmasFicha()
        this.loadProtecoesFicha()
        this.loadEquipamentosFicha()
        this.loadMagiasFicha()
        this.loadHabilidadesFicha()
        this.loadPericiasFicha(ficha.id)
        this.loadHistoricoFicha(ficha.id)
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

      voltarParaLista() {
        this.viewMode = 'list'
        this.selectedCharId = null
        this.form = buildEmptyForm()
        this.expandedAtaqueArmaId = null
        this.armasCarregadas = []
        this.protecoesCarregadas = []
        this.equipamentosCarregados = []
        this.magiasCarregadas = []
        this.habilidadesCarregadas = []
        this.carregarFichas()
      },

      novaFicha() {
        this.selectedCharId = null
        this.form = buildEmptyForm()
        this.nivelAnterior = this.toNum(this.form.nivel, 1)
        this.viewMode = 'edit'
      },

      abrirWizard() {
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

      escolherRaca(raca) {
        this.wizardRaca = raca
        this.wizardRacialChoices = []
      },

      get wizardRacas() {
        return RACAS_DATA
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
        return !!raca && /Três Atributos Diferentes|3 Atributos/i.test(raca.atributos?.descricao_atributos || "")
      },

      get wizardRacialChoicesCount() {
        return this.wizardPrecisaEscolherAtributos ? 3 : 0
      },

      wizardModRacial(key) {
        if (!this.wizardRaca) return 0
        if (this.wizardPrecisaEscolherAtributos) {
          return this.wizardRacialChoices.includes(key) ? 2 : 0
        }
        const attr = ATRIBUTOS_WIZARD.find(a => a.key === key)
        if (!attr) return 0
        return this.wizardRaca.atributos?.[attr.racaKey] || 0
      },

      alternarRacialEscolha(key) {
        const max = this.wizardRacialChoicesCount
        if (max === 0) return
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
        const v = Math.max(MIN_ATRIBUTO, Math.min(MAX_ATRIBUTO, Number(valor) || 10))
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
        if (n === 2) return !!this.wizardRaca && this.wizardRacialEscolhaCompleta
        if (n === 3) return !!this.wizardRaca && this.wizardPontosRestantes === 0 && this.wizardRacialEscolhaCompleta
        return false
      },

      wizardGoTo(n) {
        if (n < 1 || n > 3) return
        if (n > this.wizardStep && !this.wizardStepReached(n)) return
        this.wizardStep = n
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
        if (!this.wizardPodeProximo) return
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
          const idCriada = data?.ficha?.id
          if (idCriada) {
            await this.adicionarHabilidadesDeRaca(idCriada, this.form.raca)
          }
          await this.carregarFichas()
          const criada = idCriada ? this.fichasApi.find(f => f.id === idCriada) : null
          if (criada) {
            this.abrirFicha(criada)
          } else {
            this.viewMode = 'edit'
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

        if (Array.isArray(c.poderes) && c.poderes.length && !this.form.proficiencias_poderes) {
          this.form.proficiencias_poderes = c.poderes.map(p => `${p.nome}: ${p.descricao}`).join('\n')
        }
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
        try {
          const { data } = await getPericiasByFicha(fichaId)
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
        try {
          const { data } = await getHistoricoByFicha(fichaId)
          const items = data?.historico || data?.data || data || []
          this.historicoCarregado = Array.isArray(items) ? items.slice().reverse() : []
        } catch (err) {
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

      async salvarDescricao() {
        if (!this.selectedCharId) return
        try {
          await updateFicha(this.selectedCharId, { descricao: this.form.anotacoes || '' })
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

      async save() {
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
            this.$store.toasts.push("Ficha atualizada com sucesso!", "success")
          } else {
            await createFicha(criarPayload)
            this.$store.toasts.push("Ficha criada com sucesso!", "success")
          }
          this.saveFeedback = true
          setTimeout(() => { this.saveFeedback = false }, 2000)
          await this.carregarFichas()
          this.viewMode = 'list'
        } catch (err) {
          console.error('Erro ao salvar ficha:', err)
          this.$store.toasts.push("Erro ao salvar ficha. Verifique os campos.", "error")
        }
      },

      toNum(v, fallback) {
        if (v === "" || v === null || v === undefined) return fallback
        const n = Number(v)
        return isNaN(n) ? fallback : n
      },

      async deleteCharacter() {
        if (!this.selectedCharId) return
        if (!confirm("Tem certeza que deseja excluir esta ficha?")) return
        try {
          await deleteFicha(this.selectedCharId)
          this.$store.toasts.push("Ficha excluída.", "success")
          this.voltarParaLista()
        } catch (err) {
          console.error("Erro ao excluir ficha:", err)
          this.$store.toasts.push("Erro ao excluir a ficha. Tente novamente.", "error")
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
        try {
          const { data } = await getArmasByFicha(this.selectedCharId)
          this.armasCarregadas = data?.data || []
        } catch (err) {
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
        try {
          const { data } = await getProtecoesByFicha(this.selectedCharId)
          this.protecoesCarregadas = data?.data || []
        } catch (err) {
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
        try {
          const { data } = await getEquipamentosByFicha(this.selectedCharId)
          this.equipamentosCarregados = data?.data || []
        } catch (err) {
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
            descricao: magia.descricao,
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
        try {
          const { data } = await getMagiasByFicha(this.selectedCharId)
          this.magiasCarregadas = data?.magias || data?.data || []
        } catch (err) {
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
        try {
          const { data } = await getHabilidadesByFicha(this.selectedCharId)
          this.habilidadesCarregadas = data?.habilidades || data?.data || []
        } catch (err) {
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

import html from "./campaign.html?raw"
import { createCampanha, getCampanhasByUser, findCampanhaByChaveLink, getPlayersByCampanha, getFichasByUser, addFichaToCampanha, removeFichaFromCampanha, getFichasByCampanha, leaveCampanha } from "../../useApi/index.js"

export default {
  html,
  data() {
    return {
      get activeTab() {
        return this.$router.is("/campanhas/entrar") ? "join" : "my"
      },
      myCampaigns: [],
      memberCampaigns: [],
      showCreate: false,
      newName: "",
      creating: false,
      joinCode: "",
      inviteCode: "",
      joinError: "",
      showFichaPopup: false,
      fichaTargetId: null,
      userFichas: [],
      loadingFichas: false,
      addingFichaId: null,
      removingFichaId: null,
      fichaSearchTerm: "",
      expandedCampaigns: {},
      leavingId: null,

      init() {
        this.loadCampaigns()
        this.$watch("$store.auth.user", () => this.loadCampaigns())
      },

      setTab(tab) {
        if (tab !== "my" && tab !== "join") return
        this.$router.push(tab === "join" ? "/campanhas/entrar" : "/campanhas/minhas")
      },

      isCollapsed(c) {
        return !this.expandedCampaigns[c.id]
      },

      toggleCollapsed(c) {
        if (this.expandedCampaigns[c.id]) {
          const next = { ...this.expandedCampaigns }
          delete next[c.id]
          this.expandedCampaigns = next
        } else {
          this.expandedCampaigns = { ...this.expandedCampaigns, [c.id]: true }
        }
      },

      isMaster(c) {
        return c.playerMestreId === this.$store.auth.user?.id
      },

      playerIdIn(c) {
        const user = this.$store.auth.user
        if (!user?.id) return null
        const player = (c.players || []).find(p => p.id === user.id || p.email === user.email)
        return player?.id ?? user.id
      },

      async leaveCampaign(c) {
        if (this.leavingId === c.id) return
        if (!confirm(`Tem certeza que deseja sair da campanha "${c.nomeCampanha}"?`)) return
        const playerId = this.playerIdIn(c)
        if (!playerId) return
        this.leavingId = c.id
        try {
          await leaveCampanha(playerId, c.id)
          this.$store.toasts.push(`Você saiu da campanha "${c.nomeCampanha}".`, "success")
          const next = { ...this.expandedCampaigns }
          delete next[c.id]
          this.expandedCampaigns = next
          await this.loadCampaigns()
        } catch (err) {
          const msg = err?.response?.data?.ErroMessage || "Erro ao sair da campanha."
          this.$store.toasts.push(msg, "error")
        } finally {
          this.leavingId = null
        }
      },

      async loadCampaigns() {
        const user = this.$store.auth.user
        if (!user?.id) return
        try {
          const { data } = await getCampanhasByUser(user.id)
          const raw = data?.campanhas || []
          const campanhas = Array.isArray(raw) ? (raw[0]?.campanhas ?? raw) : raw
          await Promise.all(campanhas.map(async c => {
            try {
              const { data } = await getPlayersByCampanha(c.id)
              c.players = data?.players?.[0]?.players || []
            } catch {
              c.players = []
            }
            try {
              const { data } = await getFichasByCampanha(c.id)
              c.fichas = data?.fichas?.fichas || []
            } catch {
              c.fichas = []
            }
          }))
          this.myCampaigns = campanhas
          this.memberCampaigns = campanhas.filter(c => c.playerMestreId !== user.id)
        } catch (err) {
          const msg = err?.response?.data?.ErroMessage || "Erro ao listar campanhas."
          this.$store.toasts.push(msg, "error")
        }
      },

      async create() {
        const user = this.$store.auth.user
        if (!this.newName.trim() || !user?.id) return
        this.creating = true
        try {
          const { data } = await createCampanha({
            nomeCampanha: this.newName.trim(),
            playerMasterId: user.id,
          })
          const campanha = data?.protecao
          this.$store.toasts.push(
            `Campanha "${campanha?.nomeCampanha || this.newName}" criada! Código: ${campanha?.chaveLink}`,
            "success"
          )
          this.showCreate = false
          this.newName = ""
          await this.loadCampaigns()
        } catch (err) {
          const msg = err?.response?.data?.ErroMessage || "Erro ao criar campanha."
          this.$store.toasts.push(msg, "error")
        } finally {
          this.creating = false
        }
      },

      async copyCode(c) {
        const code = c.chaveLink || c.codigo_convite || ""
        try {
          await navigator.clipboard.writeText(code)
          this.$store.toasts.push("Código copiado!", "success")
        } catch {
          this.$store.toasts.push("Não foi possível copiar o código.", "error")
        }
      },

      async join() {
        const code = (this.inviteCode || "").trim()
        if (!code) {
          this.joinError = "Informe o código da campanha."
          return
        }
        this.joinError = ""
        const user = this.$store.auth.user
        if (!user?.id) {
          this.$store.toasts.push("Faça login para entrar em uma campanha.", "error")
          return
        }
        try {
          const { data } = await findCampanhaByChaveLink(code, user.id)
          const campanha = data?.campanhaFinded
          if (!campanha) {
            this.joinError = "Campanha não encontrada com esse código."
            return
          }
          this.$store.toasts.push(`Você entrou na campanha "${campanha.nomeCampanha}"!`, "success")
          this.inviteCode = ""
          await this.loadCampaigns()
        } catch (err) {
          const msg = err?.response?.data?.ErroMessage || "Erro ao entrar na campanha."
          this.$store.toasts.push(msg, "error")
        }
      },

      async openFichaPopup(c) {
        this.fichaTargetId = c.id
        this.showFichaPopup = true
        const user = this.$store.auth.user
        if (!user?.id) return
        this.loadingFichas = true
        try {
          const { data } = await getFichasByUser(user.id)
          this.userFichas = data?.data || []
        } catch {
          this.userFichas = []
        } finally {
          this.loadingFichas = false
        }
      },

      closeFichaPopup() {
        this.showFichaPopup = false
        this.fichaTargetId = null
      },

      availableFichas() {
        const target = this.myCampaigns.find(c => c.id === this.fichaTargetId)
        const inCamp = target?.fichas || []
        const inCampIds = new Set(inCamp.map(f => f.id))
        const term = (this.fichaSearchTerm || "").toLowerCase().trim()
        return this.userFichas.filter(f => {
          if (inCampIds.has(f.id)) return false
          if (!term) return true
          return (f.nomePersonagem || "").toLowerCase().includes(term) ||
                 (f.classe || "").toLowerCase().includes(term)
        })
      },

      async addFichaToTarget(f) {
        if (!this.fichaTargetId) return
        this.addingFichaId = f.id
        try {
          await addFichaToCampanha(this.fichaTargetId, f.id)
          this.$store.toasts.push(`Ficha "${f.nomePersonagem}" adicionada à campanha!`, "success")
          await this.loadCampaigns()
        } catch (err) {
          const msg = err?.response?.data?.ErroMessage || "Erro ao adicionar ficha."
          this.$store.toasts.push(msg, "error")
        } finally {
          this.addingFichaId = null
        }
      },

      async removeFicha(c, f) {
        this.removingFichaId = f.id
        try {
          await removeFichaFromCampanha(c.id, f.id)
          this.$store.toasts.push(`Ficha "${f.nomePersonagem}" removida da campanha.`, "success")
          await this.loadCampaigns()
        } catch (err) {
          const msg = err?.response?.data?.ErroMessage || "Erro ao remover ficha."
          this.$store.toasts.push(msg, "error")
        } finally {
          this.removingFichaId = null
        }
      },
    }
  },
}

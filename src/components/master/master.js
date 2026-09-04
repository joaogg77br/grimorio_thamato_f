import html from "./master.html?raw"
import { getCampanhasByMaster, getPlayersByCampanha, removePlayerFromCampanha, getFichasByCampanha } from "../../useApi/index.js"
import { adicionarEmojiRaca } from "../../data/racas.js"

export default {
  html,
  data() {
    return {
      myCampaigns: [],
      selectedCampaignId: "",
      campaignPlayers: [],
      campaignFichas: [],
      viewChar: null,
      initiativeOrder: [],
      currentTurn: 0,
      initName: "",
      initValue: "",

      init() {
        this.loadCampaigns()
        this.$watch("$store.auth.user", () => {
          this.loadCampaigns()
          this.loadPlayers()
        })
      },

      async loadCampaigns() {
        const user = this.$store.auth.user
        if (!user?.id) return
        try {
          const { data } = await getCampanhasByMaster(user.id)
          this.myCampaigns = data?.campanhas || []
        } catch (err) {
          const msg = err?.response?.data?.ErroMessage || "Erro ao listar campanhas."
          this.$store.toasts.push(msg, "error")
        }
      },

      get selectedCampaign() {
        return this.myCampaigns.find(c => c.id === this.selectedCampaignId) || null
      },

      racaEmoji(nome) {
        return adicionarEmojiRaca(nome)
      },

      async copyCode() {
        const code = this.selectedCampaign?.chaveLink || ""
        try {
          await navigator.clipboard.writeText(code)
          this.$store.toasts.push("Código copiado!", "success")
        } catch {
          this.$store.toasts.push("Não foi possível copiar o código.", "error")
        }
      },

      async loadPlayers() {
        const user = this.$store.auth.user
        if (!user?.id || !this.selectedCampaignId) return
        try {
          const { data } = await getPlayersByCampanha(this.selectedCampaignId)
          const campanhas = data?.players || []
          this.campaignPlayers = campanhas[0]?.players || []
        } catch (err) {
          const msg = err?.response?.data?.ErroMessage || "Erro ao listar players."
          this.$store.toasts.push(msg, "error")
        }
      },

      async removePlayer(p) {
        if (!this.selectedCampaignId) return
        try {
          await removePlayerFromCampanha(p.id, this.selectedCampaignId)
          this.$store.toasts.push(`${p.name} removido da campanha.`, "success")
          await this.loadPlayers()
        } catch (err) {
          const msg = err?.response?.data?.ErroMessage || "Erro ao remover player."
          this.$store.toasts.push(msg, "error")
        }
      },

      async loadFichas() {
        if (!this.selectedCampaignId) {
          this.campaignFichas = []
          return
        }
        try {
          const { data } = await getFichasByCampanha(this.selectedCampaignId)
          this.campaignFichas = data?.fichas?.fichas || []
        } catch (err) {
          const msg = err?.response?.data?.ErroMessage || "Erro ao listar fichas da campanha."
          this.$store.toasts.push(msg, "error")
          this.campaignFichas = []
        }
      },

      editFicha(f) {
        this.$store.masterView.ficha = f
        this.$store.toasts.push(`Editando ficha "${f.nomePersonagem}".`, "info")
        window.dispatchEvent(new CustomEvent("grimorio:navigate", { detail: { page: "characters" } }))
      },

      addInitiative() {
        if (!this.initName.trim() || !this.initValue) return
        this.initiativeOrder.push({ nome: this.initName, valor: Number(this.initValue) })
        this.reorderInitiative()
        this.initName = ""
        this.initValue = ""
      },

      reorderInitiative() { this.initiativeOrder.sort((a, b) => b.valor - a.valor) },

      clearInitiative() { this.initiativeOrder = []; this.currentTurn = 0 },
    }
  },
}

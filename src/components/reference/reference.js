import html from "./reference.html?raw"
import condicoes from "../../../condicoes-tormenta20.json"

export default {
  html,
  data() {
    return {
      conditions: [],
      search: "",
      selectedSystem: "",
      systemSearch: "",
      systems: [
        { id: "tormenta20", name: "Tormenta20", description: "Condições e regras de referência", icon: "swords" },
      ],

      get filteredSystems() {
        const query = this.systemSearch.trim().toLocaleLowerCase("pt-BR")
        if (!query) return this.systems
        return this.systems.filter(system => `${system.name} ${system.description}`.toLocaleLowerCase("pt-BR").includes(query))
      },

      get filteredConditions() {
        if (!this.search.trim()) return this.conditions
        const q = this.search.toLowerCase()
        return this.conditions.filter(c => c.nome.toLowerCase().includes(q) || c.tipo.toLowerCase().includes(q) || c.descricao.toLowerCase().includes(q))
      },

      init() {
        this.conditions = this.buildConditions()
      },

      buildConditions() {
        return Object.entries(condicoes).map(([key, value]) => ({
          nome: this.formatName(key),
          tipo: value.tipo || "",
          descricao: value.efeitos_e_penalidades || value.descricao || "",
        }))
      },

      formatName(key) {
        return key
          .split("_")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      },
    }
  },
}

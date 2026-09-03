import html from "./dice.html?raw"
import { createHistorico } from "../../useApi/index.js"

export default {
  html,
  data() {
    return {
      DICE_TYPES: [4, 6, 8, 10, 12, 20],
      customFormula: "",
      lastResult: null,
      lastDetail: "",
      lastLabel: "",
      lastRollData: null,
      isRolling: false,
      showResult: false,
      d20Popup: { show: false, phase: "idle", value: null },
      history: [],
      maxHistory: 50,
      miniToasts: [],
      toastSeq: 0,
      advantageMode: false,
      disadvantageMode: false,
      advantageCount: 2,
      suppressToasts: false,

      init() {
        window.addEventListener("roll-dice", (e) => {
          const { formula, label, fichaId } = e.detail
          this.customFormula = formula
          this.rollCustom(label)
          if (this.lastRollData) {
            this.persistirHistorico(fichaId, this.montarRollString(this.lastRollData))
          }
        })

        window.addEventListener("roll-ataque", (e) => {
          const { arma, label, mod, danoMod, fichaId } = e.detail
          const m = Number(mod) || 0
          const sign = (m >= 0 ? "+" : "") + m
          const dm = Number(danoMod) || 0
          const dsign = (dm >= 0 ? "+" : "") + dm
          this.suppressToasts = true
          this.executeRoll(`1D20${sign}`, label)
          const ataqueTotal = this.lastResult
          const ataqueDetail = this.lastDetail
          const ataqueRollData = this.lastRollData
          const ataqueIsCrit = this.lastRollData && this.lastRollData.chosenD20 !== null && this.lastRollData.chosenD20 >= (Number(arma.critico) || 20)
          const ataqueCritFail = this.lastRollData && this.lastRollData.chosenD20 === 1
          const multiplier = Number(arma.multiplicador) || 2
          let danoTotal, danoDetail
          let critTotal
          let danoFormula
          if (ataqueIsCrit && multiplier > 1) {
            danoFormula = this.multiplyDiceFormula(arma.dadoDeDano || "1d4", multiplier) + dsign
            this.executeRoll(danoFormula, `${label} — Dano`)
            danoTotal = this.lastResult
            danoDetail = this.lastDetail
            critTotal = danoTotal
          } else {
            danoFormula = `${arma.dadoDeDano || "1d4"}${dsign}`
            this.executeRoll(danoFormula, `${label} — Dano`)
            danoTotal = this.lastResult
            danoDetail = this.lastDetail
            critTotal = danoTotal
          }
          const danoRollData = this.lastRollData
          const valorHistorico = `${this.montarRollString(ataqueRollData)}, Dano:${this.montarRollString(danoRollData)}`
          this.suppressToasts = false
          this.persistirHistorico(fichaId, valorHistorico)
          this.pushAtaqueToast(
            arma.nome,
            e.detail.periciaNome || (arma.pericia || ""),
            { total: ataqueTotal, detail: ataqueDetail },
            { total: critTotal, detail: danoDetail, baseTotal: danoTotal, isCrit: ataqueIsCrit, isCritFail: ataqueCritFail, multiplier }
          )
        })
      },

      pushAtaqueToast(weaponName, periciaNome, ataque, dano) {
        const isCrit = dano.isCrit
        const animated = isCrit || dano.isCritFail
        const duration = isCrit ? 10000 : 6000
        const slot = {
          variant: "ataque",
          weaponName,
          periciaNome,
          ataque,
          dano,
          isCrit,
          isCritFail: dano.isCritFail,
        }
        const show = () => {
          const id = ++this.toastSeq
          const timer = setTimeout(() => {
            this.miniToasts = this.miniToasts.filter((t) => t.id !== id)
          }, duration)
          this.history = [{ label: `Ataque ${weaponName}`, result: ataque.total, detail: ataque.detail, sub: { label: "Dano", result: dano.isCrit ? dano.baseTotal : dano.total, detail: dano.detail, multiplied: dano.isCrit, multiplier: dano.multiplier } }, ...this.history].slice(0, this.maxHistory)
          this.miniToasts = [{ ...slot, id, timer }, ...this.miniToasts].slice(0, 5)
        }
        if (animated && this.$store.critAnim.enabled) {
          setTimeout(show, 4900)
        } else {
          show()
        }
      },

      pushMiniToast(label, result, detail, rolls, isCrit = false) {
        const sorted = rolls ? [...rolls].sort((a, b) => a.value - b.value) : []
        const id = ++this.toastSeq
        const duration = isCrit ? 10000 : 4000
        const timer = setTimeout(() => {
          this.miniToasts = this.miniToasts.filter((t) => t.id !== id)
        }, duration)
        this.miniToasts = [{ id, label, result, detail, rolls: sorted, timer, isCrit }, ...this.miniToasts].slice(0, 5)
      },

      dismissMiniToast(id) {
        this.miniToasts = this.miniToasts.filter((t) => t.id !== id)
      },

      hoverToast(id) {
        const toast = this.miniToasts.find((t) => t.id === id)
        if (toast && toast.timer) {
          clearTimeout(toast.timer)
          toast.timer = null
        }
      },

      leaveToast(id) {
        const toast = this.miniToasts.find((t) => t.id === id)
        if (toast && !toast.timer) {
          toast.timer = setTimeout(() => {
            this.miniToasts = this.miniToasts.filter((t) => t.id !== id)
          }, 4000)
        }
      },

      roll(sides) {
        this.executeRoll(`1D${sides}`, `D${sides}`)
      },

      clearHistory() {
        this.history = []
      },

      rollCustom(label) {
        if (!this.customFormula) return
        this.executeRoll(this.customFormula, label || this.customFormula)
      },

      toggleAdv(mode) {
        if (mode === "advantage") {
          this.advantageMode = !this.advantageMode
          if (this.advantageMode) this.disadvantageMode = false
        } else {
          this.disadvantageMode = !this.disadvantageMode
          if (this.disadvantageMode) this.advantageMode = false
        }
      },

      playDiceSound() {
        if (!this.$store.sound.enabled) return
        try {
          const audio = new Audio("/sounds/DiceSounds.mp3")
          audio.volume = 0.5
          audio.play()
        } catch { }
      },

      multiplyDiceFormula(formula, multiplier) {
        const parts = String(formula || "").split("+")
        return parts.map((p) => {
          const t = p.trim().toLowerCase()
          const diceMatch = /^(\d*)d(\d+)$/.exec(t)
          if (diceMatch) {
            const count = diceMatch[1] ? parseInt(diceMatch[1], 10) : 1
            return `${count * multiplier}d${diceMatch[2]}`
          }
          return p
        }).join("+")
      },

      executeRoll(formula, label) {
        try {
          const parsed = this.parseDice(formula)
          const rolls = []
          const diceDetails = []
          const mods = []
          const groups = []
          let total = 0
          let usedAdv = false
          let chosenD20 = null
          for (const part of parsed.parts) {
            if (part.type === "dice") {
              const hasAdv = part.sides === 20 && (this.advantageMode || this.disadvantageMode)
              if (hasAdv) usedAdv = true
              const groupRolls = []
              for (let i = 0; i < part.count; i++) {
                if (hasAdv) {
                  const outcomes = []
                  let chosen = this.advantageMode ? 0 : Infinity
                  for (let t = 0; t < this.advantageCount; t++) {
                    const r = Math.floor(Math.random() * part.sides) + 1
                    diceDetails.push({ value: r, sides: part.sides })
                    outcomes.push(r)
                    chosen = this.advantageMode ? Math.max(chosen, r) : Math.min(chosen, r)
                  }
                  const sorted = this.advantageMode ? [...outcomes].sort((a, b) => b - a) : [...outcomes].sort((a, b) => a - b)
                  groupRolls.push(...sorted)
                  rolls.push(...sorted)
                  total += chosen
                  chosenD20 = chosen
                } else {
                  const r = Math.floor(Math.random() * part.sides) + 1
                  rolls.push(r)
                  diceDetails.push({ value: r, sides: part.sides })
                  groupRolls.push(r)
                  total += r
                  if (part.sides === 20) chosenD20 = r
                }
              }
              groups.push({ type: "dice", sides: part.sides, count: part.count, hasAdv, rolls: groupRolls })
            } else if (part.type === "mod") {
              total += part.value
              mods.push((part.value >= 0 ? "+" : "") + part.value)
              groups.push({ type: "mod", value: part.value })
            }
          }
          const isCrit = chosenD20 !== null && (chosenD20 === 20 || chosenD20 === 1)
          let detail = rolls.length ? `[${rolls.join(", ")}]` : ""
          if (mods.length) {
            detail = detail ? `${detail} ${mods.join(" ")}` : mods.join(" ")
          }
          this.lastResult = total
          this.lastDetail = detail
          this.lastLabel = label
          this.lastRollData = { formula, rolls, mods, total, groups, isD20: chosenD20 !== null, chosenD20 }
          this.isRolling = true
          this.history = [{ label, result: total, detail }, ...this.history].slice(0, this.maxHistory)
          this.playDiceSound()
          if (isCrit) {
            this.showResult = false
            this.triggerD20Popup(chosenD20)
          } else {
            this.showResult = true
          }
          if (!this.suppressToasts) {
            this.pushMiniToast(label, total, detail, diceDetails, isCrit)
          }
          setTimeout(() => { this.isRolling = false }, 400)
        } catch {
          this.lastResult = "Erro"
          this.lastDetail = "Fórmula inválida"
          this.lastRollData = null
          this.showResult = true
        }
      },

      montarFormulaFromGroups(groups) {
        return (groups || []).map((g) => {
          if (g.type === "mod") return (g.value >= 0 ? "+" : "") + g.value
          const count = g.hasAdv ? this.advantageCount : (g.count || 1)
          return `${count}d${g.sides}`
        }).join("")
      },

      montarRollString(data) {
        if (!data) return ""
        const formula = this.montarFormulaFromGroups(data.groups) || String(data.formula || "").toLowerCase()
        return `${formula} = ${data.total}`
      },

      async persistirHistorico(fichaId, value) {
        if (!fichaId) return
        try {
          await createHistorico(fichaId, value)
          window.dispatchEvent(new CustomEvent("historico-atualizado", { detail: { fichaId } }))
        } catch (err) {
          console.error("Erro ao salvar histórico:", err)
        }
      },

      playSuccessSound() {
        if (!this.$store.sound.enabled) return
        try {
          const audio = new Audio("/sounds/SucessSoundEffect.mp3")
          audio.volume = 0.5
          audio.play()
        } catch { }
      },

      playFailSound() {
        if (!this.$store.sound.enabled) return
        try {
          const audio = new Audio("/sounds/Fail.mp3")
          audio.volume = 0.5
          audio.play()
        } catch { }
      },

      playAcertoCriticoSound() {
        if (!this.$store.sound.enabled) return
        try {
          const audio = new Audio("/sounds/AcertoCriticoMeuAudio.mp3")
          audio.volume = 0.5
          audio.play()
        } catch { }
      },

      playFalhaCriticaSound() {
        if (!this.$store.sound.enabled) return
        try {
          const audio = new Audio("/sounds/FalhaCriticaMeuAudio.mp3")
          audio.volume = 0.5
          audio.play()
        } catch { }
      },

      setPhase(phase) {
        this.d20Popup = { ...this.d20Popup, phase }
      },

      setD20Popup(state) {
        this.d20Popup = { ...this.d20Popup, ...state }
      },

      triggerD20Popup(value) {
        if (this.d20Popup.show) return
        if (!this.$store.critAnim.enabled) {
          this.showResult = true
          return
        }
        this.setD20Popup({ show: true, phase: "animating", value })
        setTimeout(() => {
          this.setPhase("fadeout")
          setTimeout(() => {
            this.setD20Popup({ show: false, phase: "idle", value: null })
            this.showResult = true
          }, 400)
        }, 4500)
      },

      onSpinEnd() {
        if (this.d20Popup.phase === "animating") {
          this.setPhase("result")
          if (this.d20Popup.value === 20) {
            this.playSuccessSound()
            this.playAcertoCriticoSound()
          }
          if (this.d20Popup.value === 1) {
            this.playFailSound()
            this.playFalhaCriticaSound()
          }
        }
      },

      parseDice(formula) {
        const parts = []
        const regex = /(\d*)d(\d+)|([+-]\d+)|(\d+)/gi
        let match
        while ((match = regex.exec(formula)) !== null) {
          if (match[1] !== undefined || match[2] !== undefined) {
            parts.push({ type: "dice", count: match[1] ? parseInt(match[1]) : 1, sides: parseInt(match[2]) })
          } else {
            const val = parseInt(match[0])
            if (!isNaN(val)) parts.push({ type: "mod", value: val })
          }
        }
        return { parts }
      },
    }
  },
}

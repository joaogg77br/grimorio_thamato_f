import Alpine from "alpinejs"
import alpineRouter from "@shaun/alpinejs-router"
import { APP_PATHS, PUBLIC_PATHS, FICHA_PATHS } from "./lib/routes.js"
import "./style.css"
import "./ui.css"
import "./home.css"
import { io } from "socket.io-client"

const socket = io("https://grimorioback.vercel.app/", {
  transports: ["websocket"]
})

import character from "./components/character/character.js"
  import dice from "./components/dice/dice.js"
import campaign from "./components/campaign/campaign.js"
import master from "./components/master/master.js"
import reference from "./components/reference/reference.js"
import auth from "./components/auth/auth.js"

import { localDB } from "./lib/localDB.js"
import { sheetBackgroundFiles } from "./lib/sheetBackgroundFiles.js"
import { checkLogged } from "./useApi/index.js"

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000
const storedSession = localDB.getSession()
const initialUser = storedSession?.user || null
const initialToken = storedSession?.token || null
const hasInitialSession = Boolean(initialUser?.id && initialUser.email && initialToken)
if (!hasInitialSession) localDB.clearSession()

const THEME_KEY = "grimorio_theme"
const THEME_OPTIONS = ["red", "blue", "purple"]
const SHEET_BACKGROUND_KEY = "grimorio_sheet_background"
const SHEET_BACKGROUND_MAX_BYTES = 20 * 1024 * 1024

function normalizeTheme(theme) {
  return THEME_OPTIONS.includes(theme) ? theme : "red"
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = normalizeTheme(theme)
}

applyTheme(localStorage.getItem(THEME_KEY))

Alpine.plugin(alpineRouter)

document.addEventListener("alpine:init", () => {
  Alpine.store("toasts", {
    items: [],
    seq: 0,
    push(message, type = "success") {
      const id = ++this.seq
      this.items.push({ id, message, type })
      setTimeout(() => this.dismiss(id), 3400)
    },
    dismiss(id) {
      const toast = this.items.find((t) => t.id === id)
      if (!toast || toast.leaving) return
      toast.leaving = true
      setTimeout(() => {
        this.items = this.items.filter((t) => t.id !== id)
      }, 280)
    },
  })

  Alpine.store("sound", {
    _enabled: localStorage.getItem("grimorio_sound") !== "off",
    get enabled() {
      return this._enabled
    },
    set enabled(v) {
      this._enabled = v
      localStorage.setItem("grimorio_sound", v ? "on" : "off")
    },
    toggle() {
      this.enabled = !this.enabled
    },
  })

  Alpine.store("critAnim", {
    _enabled: localStorage.getItem("grimorio_crit_anim") !== "off",
    get enabled() {
      return this._enabled
    },
    set enabled(v) {
      this._enabled = v
      localStorage.setItem("grimorio_crit_anim", v ? "on" : "off")
    },
    toggle() {
      this.enabled = !this.enabled
    },
  })

  Alpine.store("sheetBackground", {
    url: localStorage.getItem(SHEET_BACKGROUND_KEY) || "",
    sheetOpen: false,
    busy: true,
    async init() {
      try {
        const file = await sheetBackgroundFiles.read()
        if (file) this.replaceUrl(URL.createObjectURL(file))
      } catch {
        Alpine.store("toasts").push("Não foi possível recuperar o fundo salvo.", "error")
      } finally {
        this.busy = false
      }
    },
    get hasImage() {
      return Boolean(this.url)
    },
    get canEdit() {
      return Alpine.$router.is(...FICHA_PATHS) && this.sheetOpen
    },
    setSheetOpen(open) {
      this.sheetOpen = Boolean(open)
    },
    warnUnavailable() {
      Alpine.store("toasts").push("Abra uma ficha salva para alterar o fundo.", "info")
    },
    replaceUrl(url) {
      const previous = this.url
      this.url = url
      if (previous.startsWith("blob:")) URL.revokeObjectURL(previous)
    },
    async setFromFile(file) {
      if (!file || this.busy) return
      if (!this.canEdit) {
        this.warnUnavailable()
        return
      }
      if (!file.type?.startsWith("image/") && !(!file.type && /\.gif$/i.test(file.name))) {
        Alpine.store("toasts").push("Escolha um arquivo de imagem ou GIF.", "error")
        return
      }
      if (file.size > SHEET_BACKGROUND_MAX_BYTES) {
        Alpine.store("toasts").push("Escolha uma imagem ou GIF de até 20 MB.", "error")
        return
      }
      this.busy = true
      let url = ""
      try {
        url = URL.createObjectURL(file)
        const image = new Image()
        image.src = url
        await image.decode()
        await sheetBackgroundFiles.save(file)
        localStorage.removeItem(SHEET_BACKGROUND_KEY)
        this.replaceUrl(url)
        Alpine.store("toasts").push("Fundo da ficha atualizado.", "success")
      } catch {
        if (url) URL.revokeObjectURL(url)
        Alpine.store("toasts").push("Não foi possível carregar ou salvar o fundo. Tente outro arquivo ou libere espaço no navegador.", "error")
      } finally {
        this.busy = false
      }
    },
    async clear() {
      if (this.busy) return
      if (!this.canEdit) {
        this.warnUnavailable()
        return
      }
      this.busy = true
      try {
        await sheetBackgroundFiles.clear()
        localStorage.removeItem(SHEET_BACKGROUND_KEY)
        this.replaceUrl("")
        Alpine.store("toasts").push("Fundo da ficha removido.", "info")
      } catch {
        Alpine.store("toasts").push("Não foi possível remover o fundo. Tente novamente.", "error")
      } finally {
        this.busy = false
      }
    },
  })

  Alpine.store("theme", {
    options: [
      { id: "red", label: "Vermelho", icon: "local_fire_department" },
      { id: "blue", label: "Azul", icon: "water_drop" },
      { id: "purple", label: "Roxo", icon: "auto_awesome" },
    ],
    current: normalizeTheme(localStorage.getItem(THEME_KEY)),
    set(theme) {
      this.current = normalizeTheme(theme)
      localStorage.setItem(THEME_KEY, this.current)
      applyTheme(this.current)
    },
    is(theme) {
      return this.current === theme
    },
  })

  Alpine.store("auth", {
    user: null,
    token: null,
    authenticated: false,
    checking: hasInitialSession,
  })

  Alpine.store("masterView", {
    ficha: null,
  })

  Alpine.data("app", () => ({
    settingsOpen: false,
    autoLoginAttempted: false,
    sessionCheckTimer: null,
    sessionCheckInProgress: false,

    guardRoute() {
      this.settingsOpen = false
      if (!this.autoLoginAttempted) return
      if (!this.$store.auth.authenticated && !this.$router.is(...PUBLIC_PATHS)) {
        this.$router.replace("/")
      } else if (this.$store.auth.authenticated && this.$router.is(...PUBLIC_PATHS)) {
        this.$router.replace("/inicio")
      } else if (!this.$router.is(...APP_PATHS)) {
        this.$router.replace(this.$store.auth.authenticated ? "/inicio" : "/")
      }
    },

    clearSession({ notify = true, message = "Sua sessão expirou. Entre novamente." } = {}) {
      const auth = this.$store.auth
      const hadSession = Boolean(auth.user || auth.token)
      localDB.clearSession()
      auth.user = null
      auth.token = null
      auth.authenticated = false
      auth.checking = false
      if (notify && hadSession) this.$store.toasts.push(message, "error")
      if (!this.$router.is(...PUBLIC_PATHS)) this.$router.replace("/")
    },

    async restoreSession() {
      const auth = this.$store.auth
      if (!hasInitialSession) {
        auth.checking = false
        return false
      }

      try {
        const { data } = await checkLogged({
          token: initialToken,
          email: initialUser.email,
        })
        if (data?.success !== true) {
          this.clearSession({ notify: false })
          this.$store.toasts.push("Sua sessão expirou. Entre novamente.", "error")
          return false
        }
        auth.user = initialUser
        auth.token = initialToken
        auth.authenticated = true
        return true
      } catch (err) {
        this.clearSession({ notify: false })
        const status = err?.response?.status
        const message = status && status < 500
          ? "Sua sessão expirou. Entre novamente."
          : "Não foi possível validar sua sessão. Tente entrar novamente."
        this.$store.toasts.push(message, "error")
        return false
      } finally {
        auth.checking = false
      }
    },

    async checkSession({ notify = false } = {}) {
      const auth = this.$store.auth
      if (this.sessionCheckInProgress) return auth.authenticated
      if (!auth.authenticated || !auth.user?.email || !auth.token) return false

      this.sessionCheckInProgress = true
      try {
        const { data } = await checkLogged({
          token: auth.token,
          email: auth.user.email,
        })
        if (data?.success !== true) {
          this.clearSession()
          return false
        }
        auth.authenticated = true
        return true
      } catch (err) {
        const status = err?.response?.status
        if (status && status < 500) {
          this.clearSession()
          return false
        }
        if (notify) this.$store.toasts.push("Não foi possível confirmar sua sessão.", "error")
        return auth.authenticated
      } finally {
        this.sessionCheckInProgress = false
      }
    },

    async logout() {
      localDB.clearSession()
      this.$store.auth.user = null
      this.$store.auth.token = null
      this.$store.auth.authenticated = false
      this.settingsOpen = false
      this.$store.toasts.push("Você saiu da conta.", "info")
      this.$router.replace("/")
    },

    async init() {
      window.addEventListener("grimorio:unauthorized", () => this.clearSession())
      this.$watch("$router.path", () => this.guardRoute())
      await this.restoreSession()
      this.autoLoginAttempted = true
      this.guardRoute()

      this.sessionCheckTimer = window.setInterval(() => {
        if (this.$store.auth.authenticated) this.checkSession()
      }, SESSION_CHECK_INTERVAL)

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && this.$store.auth.authenticated) {
          this.checkSession()
        }
      })
    },
  }))

  Alpine.data("character", () => character.data())
  Alpine.data("dice", () => dice.data())
  Alpine.data("campaign", () => campaign.data())
  Alpine.data("master", () => master.data())
  Alpine.data("reference", () => reference.data())
  Alpine.data("auth", () => auth.data())

  Alpine.data("selectField", (config = {}) => ({
    open: false,
    get value() { return config.value ? config.value() : undefined },
    get options() { return config.options ? config.options() : [] },
    ident(o) {
      if (config.identify) return config.identify(o)
      return o && typeof o === "object" ? o.id : o
    },
    optLabel(o) {
      if (config.labelOf) return config.labelOf(o)
      return typeof o === "object" ? (o.nomeCampanha || o.nome || o.name || "") : String(o)
    },
    get selected() {
      return this.options.find((o) => this.ident(o) === this.value)
    },
    get label() {
      return this.selected ? this.optLabel(this.selected) : (config.placeholder || "Selecione")
    },
    get emptyText() {
      return config.emptyText || "Nenhuma opção disponível."
    },
    toggle() {
      this.open = !this.open
    },
    close() {
      this.open = false
    },
    pick(o) {
      const value = this.ident(o)
      if (config.onchange) config.onchange(value, o)
      this.close()
    },
  }))
})

window.Alpine = Alpine
window.grimorioSocket = socket

Alpine.start()

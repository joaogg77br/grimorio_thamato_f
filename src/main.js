import Alpine from "alpinejs"
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
import { checkLogged } from "./useApi/index.js"

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000
const storedSession = localDB.getSession()
const initialUser = storedSession?.user || null
const initialToken = storedSession?.token || null
const hasInitialSession = Boolean(initialUser?.id && initialUser.email && initialToken)
if (!hasInitialSession) localDB.clearSession()

const ROUTES = {
  "/": "login",
  "/cadastro": "register",
  "/inicio": "home",
  "/personagens": "characters",
  "/campanhas": "campaigns",
  "/mestre": "master",
  "/referencia": "reference",
  "/perfil": "profile",
}

const PAGES = Object.fromEntries(
  Object.entries(ROUTES).map(([path, page]) => [page, path])
)

const PUBLIC_PAGES = ["login", "register"]

function pageFromPath(path) {
  return ROUTES[path] || "home"
}

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

  Alpine.store("auth", {
    user: null,
    token: null,
    authenticated: false,
    checking: hasInitialSession,
  })

  Alpine.store("masterView", {
    ficha: null,
  })

  Alpine.data("router", () => ({
    currentPage: pageFromPath(window.location.pathname),
    settingsOpen: false,
    autoLoginAttempted: false,
    sessionCheckTimer: null,
    sessionCheckInProgress: false,

    navigate(page) {
      this.currentPage = page
      this.settingsOpen = false
      history.pushState({ page }, "", PAGES[page] || "/")
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
      if (!PUBLIC_PAGES.includes(this.currentPage)) this.navigate("login")
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
      this.navigate("login")
    },

    async init() {
      window.addEventListener("grimorio:unauthorized", () => this.clearSession())
      await this.restoreSession()

      if (
        this.$store.auth.authenticated &&
        PUBLIC_PAGES.includes(this.currentPage)
      ) {
        this.navigate("home")
      } else if (
        !this.$store.auth.authenticated &&
        !PUBLIC_PAGES.includes(this.currentPage)
      ) {
        this.navigate("login")
      }
      this.autoLoginAttempted = true

      this.$watch("currentPage", (page) => {
        if (
          this.autoLoginAttempted &&
          !this.$store.auth.authenticated &&
          !PUBLIC_PAGES.includes(page)
        ) {
          this.navigate("login")
        }
      })

      window.addEventListener("popstate", () => {
        const page = pageFromPath(window.location.pathname)
        if (
          this.autoLoginAttempted &&
          !this.$store.auth.authenticated &&
          !PUBLIC_PAGES.includes(page)
        ) {
          this.navigate("login")
          return
        }
        this.currentPage = page
      })

      window.addEventListener("grimorio:navigate", (e) => {
        if (e.detail?.page) this.navigate(e.detail.page)
      })

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
    }
import Alpine from "alpinejs"
import "./style.css"

import character from "./components/character/character.js"
import dice from "./components/dice/dice.js"
import campaign from "./components/campaign/campaign.js"
import master from "./components/master/master.js"
import reference from "./components/reference/reference.js"
import auth from "./components/auth/auth.js"
import { localDB } from "./lib/localDB.js"
import { loginUser, findAllUsers } from "./useApi/index.js"

const DEV_USER_ID = crypto.randomUUID()

const ROUTES = {
  "/": "login",
  "/cadastro": "register",
  "/inicio": "home",
  "/personagens": "characters",
  "/campanhas": "campaigns",
  "/mestre": "master",
  "/referencia": "reference",
}

const PAGES = Object.fromEntries(
  Object.entries(ROUTES).map(([path, page]) => [page, path])
)

const PUBLIC_PAGES = ["login", "register"]

function pageFromPath(path) {
  return ROUTES[path] || "home"
}

async function tryAutoLogin(stored) {
  try {
    await loginUser({ emailOrNickName: stored.name })
    const { data } = await findAllUsers()
    const alvo = stored.name.toLowerCase()
    const found = data?.usersFind?.find(
      (u) =>
        u.email?.toLowerCase() === alvo ||
        u.name?.toLowerCase() === alvo
    )
    if (found) return { id: found.id, name: found.name }
  } catch {}
  return null
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
    user: localDB.getSession() || null,
    authenticated: false,
  })

  Alpine.store("masterView", {
    ficha: null,
  })

  Alpine.data("router", () => ({
    currentPage: pageFromPath(window.location.pathname),
    settingsOpen: false,
    autoLoginAttempted: false,

    navigate(page) {
      this.currentPage = page
      this.settingsOpen = false
      history.pushState({ page }, "", PAGES[page] || "/")
    },

    async logout() {
      localDB.clearSession()
      this.$store.auth.user = null
      this.$store.auth.authenticated = false
      this.settingsOpen = false
      this.$store.toasts.push("Você saiu da conta.", "info")
      this.navigate("login")
    },

    async init() {
      const stored = localDB.getSession()
      if (stored && !this.$store.auth.authenticated) {
        const validUser = await tryAutoLogin(stored)
        if (validUser) {
          this.$store.auth.user = validUser
          this.$store.auth.authenticated = true
          if (PUBLIC_PAGES.includes(this.currentPage)) {
            this.navigate("home")
          }
        } else {
          localDB.clearSession()
          this.$store.auth.user = null
          if (!PUBLIC_PAGES.includes(this.currentPage)) {
            this.navigate("login")
          }
        }
      } else if (!stored && !PUBLIC_PAGES.includes(this.currentPage)) {
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
      const v = this.value
      return this.options.find(o => this.ident(o) === v) || null
    },
    get label() {
      return this.selected ? this.optLabel(this.selected) : (config.placeholder || "Selecione...")
    },
    get emptyText() { return config.emptyText || "Nenhuma opção." },
    toggle() { this.open = !this.open },
    close() { this.open = false },
    pick(o) {
      if (config.onchange) config.onchange(this.ident(o))
      this.open = false
    },
  }))
})

Alpine.start()

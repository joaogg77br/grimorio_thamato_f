import { vi } from "vitest"
import character from "../../src/components/character/character.js"

export function createCharacter() {
  const state = character.data()
  state.$store = {
    auth: { user: { id: "test-user", name: "Jogador" } },
    toasts: { push: vi.fn() },
    sheetBackground: { setSheetOpen: vi.fn() },
  }
  let url = new URL("http://localhost/personagens")
  state.$router = {
    get path() { return url.pathname },
    get query() { return Object.fromEntries(url.searchParams) },
    is: (...paths) => paths.includes(url.pathname),
    push: vi.fn(path => { url = new URL(path, url) }),
    replace: vi.fn(path => { url = new URL(path, url) }),
    resolve: () => url.pathname + url.search,
  }
  state.$nextTick = callback => Promise.resolve().then(callback)
  return state
}

export function deferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

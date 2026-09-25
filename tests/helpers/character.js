import { vi } from "vitest"
import character from "../../src/components/character/character.js"

export function createCharacter() {
  const state = character.data()
  state.$store = {
    auth: { user: { id: "test-user", name: "Jogador" } },
    toasts: { push: vi.fn() },
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

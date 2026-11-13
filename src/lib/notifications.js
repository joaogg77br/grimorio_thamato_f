export function createConfirmationStore() {
  let resolvePending = null
  return {
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirmar",
    danger: true,
    request({ title, message, confirmLabel = "Confirmar", danger = true }) {
      if (this.open) return Promise.resolve(false)
      this.title = title
      this.message = message
      this.confirmLabel = confirmLabel
      this.danger = danger
      this.open = true
      return new Promise(resolve => { resolvePending = resolve })
    },
    settle(confirmed = false) {
      const resolve = resolvePending
      resolvePending = null
      this.open = false
      resolve?.(confirmed === true)
    },
  }
}

export function createToastStore() {
  const timers = new Map()
  return {
    items: [],
    seq: 0,
    push(message, type = "success") {
      const id = ++this.seq
      this.items.push({ id, message, type: ["success", "error", "info"].includes(type) ? type : "info", leaving: false })
      timers.set(id, { remaining: 3400, startedAt: Date.now(), timer: setTimeout(() => this.dismiss(id), 3400) })
      return id
    },
    pause(id) {
      const timer = timers.get(id)
      if (!timer || timer.timer === null) return
      clearTimeout(timer.timer)
      timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt))
      timer.timer = null
    },
    resume(id) {
      const timer = timers.get(id)
      if (!timer || timer.timer !== null) return
      timer.startedAt = Date.now()
      timer.timer = setTimeout(() => this.dismiss(id), timer.remaining)
    },
    dismiss(id) {
      const toast = this.items.find(item => item.id === id)
      if (!toast || toast.leaving) return
      clearTimeout(timers.get(id)?.timer)
      timers.delete(id)
      toast.leaving = true
      setTimeout(() => { this.items = this.items.filter(item => item.id !== id) }, 280)
    },
  }
}

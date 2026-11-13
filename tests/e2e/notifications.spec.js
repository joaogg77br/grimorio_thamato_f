import { test, expect } from "@playwright/test"

async function prepare(page) {
  const api = { errors: [], dialogs: [], deletes: 0, failDelete: false, cards: [{ id: 7, nomePersonagem: "Arin", nomeJogador: "Jogador", classe: "Guerreiro", raca: "Humano", nivel: 1 }] }
  page.on("pageerror", error => api.errors.push(error.message))
  page.on("dialog", async dialog => { api.dialogs.push(dialog.type()); await dialog.dismiss() })
  await page.routeWebSocket(/\/socket\.io\//, socket => socket.close())
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("grimorio_session", JSON.stringify({ user: { id: 1, name: "Jogador", email: "notifications@example.test" }, token: "test-token" }))
    localStorage.setItem("grimorio_sound", "off")
  })
  await page.route(/\/logged$|\/(todasAsFichas|campanha|deleteFicha)\//, route => {
    const path = new URL(route.request().url()).pathname
    let status = 200, body = { success: true, campanhas: [] }
    if (path.includes("/todasAsFichas/")) body = { data: api.cards }
    if (path.includes("/deleteFicha/")) {
      api.deletes++
      if (api.failDelete) status = 500
      else api.cards = []
    }
    return route.fulfill({ status, json: body })
  })
  await page.goto("/personagens")
  await expect(page.locator(".ficha-card")).toHaveCount(1)
  return api
}

test("confirmação preserva ao cancelar, aceita teclado e exclui apenas após confirmar", async ({ page }, testInfo) => {
  const api = await prepare(page)
  const remove = page.getByRole("button", { name: "Excluir", exact: true })
  const dialog = page.getByRole("dialog", { name: "Excluir ficha?", exact: true })
  await remove.click()
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText("Arin")
  await expect(dialog.getByRole("button", { name: "Cancelar", exact: true })).toBeFocused()
  expect(api.deletes).toBe(0)
  await page.keyboard.press("Tab")
  await expect(dialog.getByRole("button", { name: "Excluir ficha", exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(remove).toBeFocused()
  expect(api.deletes).toBe(0)
  await remove.click()
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click()
  await expect(dialog).toBeHidden()
  expect(api.deletes).toBe(0)
  await remove.click()
  await page.screenshot({ path: testInfo.outputPath("confirmacao.png") })
  await dialog.getByRole("button", { name: "Excluir ficha", exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(page.locator(".ficha-card")).toHaveCount(0)
  const toast = page.locator(".toast").filter({ hasText: "Ficha excluída." })
  await expect(toast).toHaveAttribute("role", "status")
  await toast.getByRole("button", { name: "Fechar notificação" }).click()
  await expect(toast).toHaveCount(0)
  expect(api.deletes).toBe(1)
  expect(api.dialogs).toEqual([])
  expect(api.errors).toEqual([])
})

test("erro usa toast acessível e mudança de página cancela a confirmação pendente", async ({ page }, testInfo) => {
  const api = await prepare(page)
  api.failDelete = true
  const remove = page.getByRole("button", { name: "Excluir", exact: true })
  const dialog = page.getByRole("dialog", { name: "Excluir ficha?", exact: true })
  await remove.click()
  await dialog.getByRole("button", { name: "Excluir ficha", exact: true }).click()
  const toast = page.getByRole("alert").filter({ hasText: "Erro ao excluir a ficha." })
  await expect(toast).toBeVisible()
  await expect(page.locator(".ficha-card")).toHaveCount(1)
  await toast.hover()
  await page.screenshot({ path: testInfo.outputPath("toast-erro.png") })
  await toast.getByRole("button", { name: "Fechar notificação" }).click()
  await expect(toast).toHaveCount(0)
  await remove.click()
  await expect(dialog).toBeVisible()
  await page.evaluate(() => Alpine.$router.push("/inicio"))
  await expect(dialog).toBeHidden()
  await expect(page).toHaveURL("/inicio")
  expect(api.deletes).toBe(1)
  expect(api.dialogs).toEqual([])
  expect(api.errors).toEqual([])
})

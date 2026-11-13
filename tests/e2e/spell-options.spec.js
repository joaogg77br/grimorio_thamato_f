import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { loadEnv } from "vite"

const magias = JSON.parse(readFileSync(new URL("../../magias-tormenta20.json", import.meta.url), "utf8"))
const apiBaseUrl = loadEnv("development", process.cwd()).VITE_API_URL ?? "http://localhost:3000"

test("lista aprimoramentos da ficha e do catálogo com custos, restrições e truques", async ({ page }, testInfo) => {
  const errors = []
  page.on("pageerror", error => errors.push(error.message))
  await page.routeWebSocket(/\/socket\.io\//, socket => socket.close())
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("grimorio_session", JSON.stringify({ user: { id: "spell-user", name: "Jogador", email: "spells@example.test" }, token: "test-token" }))
    localStorage.setItem("grimorio_sound", "off")
  })
  const luz = magias.find(magia => magia.nome === "Luz")
  await page.route(`${apiBaseUrl.replace(/\/$/, "")}/**`, route => {
    const path = new URL(route.request().url()).pathname
    let body = { data: [], magias: [], pericias: [], historico: [], campanhas: [] }
    if (path === "/logged") body = { success: true }
    if (path.includes("/todasAsFichas/")) body = { data: [{ id: 101, nomePersonagem: "Arin", classe: "Arcanista", raca: "Humano", nivel: 1, pvMax: 8, pmMax: 6 }] }
    if (path.includes("/magias/list/")) body = { magias: [{ id: 301, nome: luz.nome, tipoMagia: luz.tipoMagia, Circulo: luz.Circulo, gastoPe: luz.gastoPe, descricao: luz.descricao, truque: luz.truque }] }
    return route.fulfill({ json: body })
  })
  await page.goto("/personagens/ficha/magias?id=101")
  await expect(page.locator('[x-model="form.nome"]')).toHaveValue("Arin")
  if (testInfo.project.name === "mobile") {
    await page.locator(".t20-dock-menu-btn").click()
    await page.locator(".t20-section-menu-item").filter({ hasText: "Magias" }).click()
  }
  const panel = page.locator('.t20-tab-panel[x-show="activeTab === \'magias\'"]')
  const carried = panel.locator(".t20-carried-block")
  await carried.locator(".t20-carried-row").click()
  await expect(carried.locator(".t20-spell-option")).toHaveCount(7)
  await expect(carried.getByText("+0 PM", { exact: true })).toBeVisible()
  await expect(carried.getByText("Apenas Divinos", { exact: true })).toHaveCount(2)
  await expect(carried.locator(".t20-spell-option-requirement").first()).toHaveText("Requer 2º círculo.")
  await panel.getByRole("button", { name: /Adicionar\s+Magia/ }).click()
  const popup = page.locator('.t20-equip-popup-overlay[x-show="showMagiasPopup"]')
  const close = popup.locator(".t20-popup-close")
  await expect(close).toBeVisible()
  await expect.poll(() => close.evaluate(element => {
    const rect = element.getBoundingClientRect()
    return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2))
  })).toBe(true)
  const search = popup.locator('input[x-model="magiasSearchTerm"]')
  await search.fill("Curar Ferimentos")
  let row = popup.locator(".t20-equip-item-row").filter({ has: page.getByText("Curar Ferimentos", { exact: true }) })
  await row.locator(".t20-equip-expand-btn").click()
  await expect(row.locator(".t20-spell-option")).toHaveCount(6)
  await expect(row.locator(".t20-spell-option-cost").filter({ hasText: /^Truque$/ })).toHaveCount(2)
  await search.fill("Controlar o Clima")
  row = popup.locator(".t20-equip-item-row").filter({ has: page.getByText("Controlar o Clima", { exact: true }) })
  await row.locator(".t20-equip-expand-btn").click()
  await expect(row.getByText("Apenas Druidas", { exact: true })).toBeVisible()
  await expect(row.getByText("+1 PM", { exact: true })).toBeVisible()
  expect(await row.locator(".t20-spell-option").evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath("spell-options.png"), fullPage: true })
  await close.click()
  await expect(popup).toBeHidden()
  expect(errors).toEqual([])
})

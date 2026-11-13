import { test, expect } from "@playwright/test"

test("duplica pelo cartão sem abrir a ficha e bloqueia cliques enquanto aguarda", async ({ page }, testInfo) => {
  const errors = [], requests = []
  page.on("pageerror", error => errors.push(error.message))
  await page.routeWebSocket(/\/socket\.io\//, socket => socket.close())
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("grimorio_session", JSON.stringify({ user: { id: 1, name: "Jogador", email: "copy@example.test" }, token: "test-token" }))
    localStorage.setItem("grimorio_sound", "off")
  })
  const source = {
    id: 7, jogadorId: 1, nomePersonagem: "Arin", nomeJogador: "Jogador", raca: "Humano", classe: "Guerreiro", nivel: 1,
    origem: "Soldado", divindade: null, pvMax: 20, pvCurrent: 0, pmMax: 5, pmCurrent: 0,
    for: 18, int: 10, des: 12, con: 14, sab: 10, car: 8, tamanho: "Médio", deslocamento: 9, tibao: 10,
    items: [{ id: 11, fichaId: 7, nome: "Corda", peso: 1, descricao: "10 metros" }],
    armas: [], gerais: [], magias: [], habilidades: [{ id: 12, fichaId: 7, nome: "Poder", descricao: "Efeito", classe: "Guerreiro", gastoPe: null }],
    pericias: [], defesa: { id: 10, fichaId: 7, atributos: "DES", outros: 0 },
  }
  const cards = [{ ...source, sistema: "tormenta" }]
  let release
  const pending = new Promise(resolve => { release = resolve })
  let releaseCreation, releaseRefresh
  const pendingCreation = new Promise(resolve => { releaseCreation = resolve })
  const pendingRefresh = new Promise(resolve => { releaseRefresh = resolve })
  await page.route(/\/(logged|todasAsFichas|find|create|equipamentos|historico|campanha)\//, async route => {
    const path = new URL(route.request().url()).pathname
    let body = { data: [], campanhas: [] }
    if (path.includes("/todasAsFichas/")) {
      if (cards.length > 1) await pendingRefresh
      body = { data: cards }
    }
    if (path === "/find/ficha/7/tormenta") {
      await pending
      body = { sucess: true, fichaFetchTormenta20: source }
    }
    if (path === "/historico/list/7") body = { historico: [] }
    if (path === "/create/personagem/tormenta") {
      const payload = route.request().postDataJSON()
      requests.push(payload)
      await pendingCreation
      cards.push({ ...source, id: 20, nomePersonagem: payload.fichaFields.nomePersonagem, sistema: "tormenta" })
      body = { tormentaFicha: { id: 20 } }
    }
    await route.fulfill({ json: body })
  })
  await page.route("**/logged", route => route.fulfill({ json: { success: true } }))
  await page.goto("/personagens")
  const original = page.locator(".ficha-card").filter({ has: page.locator(".ficha-card-nome", { hasText: /^Arin$/ }) })
  const loading = page.locator(".ficha-duplicate-overlay")
  await original.getByRole("button", { name: "Duplicar ficha de Arin", exact: true }).click()
  await expect(original.locator(".ficha-card-action--duplicate")).toBeDisabled()
  await expect(original.locator(".ficha-card-action--duplicate")).toHaveAttribute("aria-busy", "true")
  await expect(original.locator(".ficha-card-action--open")).toBeDisabled()
  await expect(original.locator(".ficha-card-action--delete")).toBeDisabled()
  await expect(loading).toBeVisible()
  await expect(loading.getByRole("heading", { name: "Duplicando ficha" })).toBeVisible()
  await expect(loading.locator(".ficha-duplicate-name")).toHaveText("Arin")
  await expect(loading.locator('[aria-current="step"]')).toHaveText("1 Buscar ficha completa")
  await expect(page.locator(".fichas-lista-section")).toHaveJSProperty("inert", true)
  await expect(page).toHaveURL("/personagens")
  release()
  await expect(loading.locator('[aria-current="step"]')).toHaveText("2 Copiar dados e elementos")
  await expect(loading.locator(".is-complete")).toHaveCount(1)
  await page.screenshot({ path: testInfo.outputPath("duplicando-ficha.png"), fullPage: true })
  releaseCreation()
  await expect(loading.locator('[aria-current="step"]')).toHaveText("3 Atualizar seus personagens")
  await expect(loading.locator(".is-complete")).toHaveCount(2)
  releaseRefresh()
  await expect(loading).toBeHidden()
  await expect(page.locator(".fichas-lista-section")).toHaveJSProperty("inert", false)
  await expect(page.locator(".ficha-card")).toHaveCount(2)
  await expect(page.getByRole("heading", { name: "Arin (cópia)", exact: true })).toBeVisible()
  await expect(original.locator(".ficha-card-action--duplicate")).toBeEnabled()
  await expect(page).toHaveURL("/personagens")
  expect(requests).toHaveLength(1)
  expect(requests[0].fichaFields.items.create).toEqual([{ nome: "Corda", peso: 1, descricao: "10 metros" }])
  expect(requests[0].fichaFields.habilidades.create).toEqual([{ nome: "Poder", descricao: "Efeito", classe: "Guerreiro", gastoPe: null }])
  expect(requests[0].fichaFields.pvCurrent).toBe(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  const bounds = await original.locator(".ficha-card-action--duplicate").boundingBox()
  const cardBounds = await original.boundingBox()
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(cardBounds.x + cardBounds.width)
  await page.screenshot({ path: testInfo.outputPath("fichas-duplicadas.png"), fullPage: true })
  expect(errors).toEqual([])
})

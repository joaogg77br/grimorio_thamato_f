import { test, expect } from "@playwright/test"

const sheetURL = "/personagens/ficha/pericias?id=101"
const background = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aM1sAAAAASUVORK5CYII="

async function prepare(page, { authenticated = true } = {}) {
  const errors = []
  page.on("pageerror", error => errors.push(error.message))
  await page.routeWebSocket(/grimorioback/, socket => socket.close())
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort())
  await page.addInitScript(({ authenticated, background }) => {
    if (authenticated) {
      localStorage.setItem("grimorio_session", JSON.stringify({
        user: { id: "route-user", name: "Jogador", email: "routes@example.test" },
        token: "test-token",
      }))
    }
    localStorage.setItem("grimorio_sheet_background", background)
    localStorage.setItem("grimorio_sound", "off")
  }, { authenticated, background })
  const api = {
    errors,
    saves: [],
    failSave: false,
    waitForEquipment: null,
    ficha: { id: 101, nomePersonagem: "Arin", nomeJogador: "Jogador", raca: "Humano", classe: "Guerreiro", nivel: 1, pvMax: 20, pvCurrent: 20, pmMax: 5, pmCurrent: 5 },
  }
  await page.route(/\/(logged|todasAsFichas|equipamentos|magias|habilidades|pericias|historico|campanha|atualize)\//, async route => {
    const path = new URL(route.request().url()).pathname
    let body = { data: [], campanhas: [], pericias: [], historico: [] }
    let status = 200
    if (path.includes("/todasAsFichas/")) body = { data: [api.ficha] }
    if (path.includes("/atualize/ficha/personagem/")) {
      const payload = route.request().postDataJSON()
      api.saves.push(payload)
      if (api.failSave) status = 500
      else Object.assign(api.ficha, payload)
      body = { data: api.ficha }
    }
    if (path.includes("/equipamentos/listAll/") && api.waitForEquipment) await api.waitForEquipment
    await route.fulfill({ status, json: body })
  })
  await page.route("**/logged", route => route.fulfill({ json: { success: true } }))
  return api
}

async function openSheet(page) {
  await page.goto("/personagens")
  await page.locator(".ficha-card-action--open").click()
  await expect(page).toHaveURL(sheetURL)
  await expect(page.locator('[x-model="form.nome"]')).toBeEditable()
}

test("abre, sai e retorna a ficha com background e historico do navegador", async ({ page }, testInfo) => {
  const api = await prepare(page)
  await openSheet(page)
  const sheet = page.locator(".character-page-wrapper")
  const list = page.locator(".fichas-lista-section")
  await expect(sheet).toHaveClass(/has-character-bg/)
  await expect(page.locator(".character-background-image")).toHaveAttribute("src", background)
  await page.screenshot({ path: testInfo.outputPath("ficha.png"), fullPage: true })
  await page.locator(".t20-exit-sheet").click()
  await expect(page).toHaveURL("/personagens")
  await expect(list).toBeVisible()
  await expect(sheet).toBeHidden()
  await page.goBack()
  await expect(page).toHaveURL(sheetURL)
  await expect(page.locator('[x-model="form.nome"]')).toHaveValue("Arin")
  await expect(sheet).toBeVisible()
  await page.goForward()
  await expect(list).toBeVisible()
  await expect(sheet).toBeHidden()
  await page.locator(".ficha-card-action--open").click()
  await expect(sheet).toBeVisible()
  await page.getByRole("navigation").getByRole("button", { name: "Início", exact: true }).click()
  await page.getByRole("navigation").getByRole("button", { name: "Personagens", exact: true }).click()
  await expect(list).toBeVisible()
  await expect(sheet).toBeHidden()
  await page.screenshot({ path: testInfo.outputPath("lista.png"), fullPage: true })
  expect(api.saves).toHaveLength(0)
  expect(api.errors).toEqual([])
})

test("restaura acesso direto e recarga de uma secao da ficha", async ({ page }) => {
  const api = await prepare(page)
  await page.goto("/personagens/ficha/inventario?id=101")
  await expect(page.locator('[x-model="form.nome"]')).toBeEditable()
  await expect(page.locator(".character-page-wrapper")).toBeVisible()
  await page.reload()
  await expect(page.locator('[x-model="form.nome"]')).toHaveValue("Arin")
  await expect.poll(() => page.evaluate(() => Alpine.$data(document.querySelector('[x-data="character"]')).activeTab)).toBe("inventario")
  expect(api.errors).toEqual([])
})

test("salva alteracoes pendentes ao sair pela navbar sem alterar o destino", async ({ page }) => {
  const api = await prepare(page)
  await openSheet(page)
  await page.locator('[x-model="form.nome"]').fill("Arin atualizado")
  await page.getByRole("navigation").getByRole("button", { name: "Campanhas", exact: true }).click()
  await expect(page).toHaveURL("/campanhas/minhas")
  await expect.poll(() => api.saves.length).toBe(1)
  expect(api.saves[0].nomePersonagem).toBe("Arin atualizado")
  await page.getByRole("navigation").getByRole("button", { name: "Personagens", exact: true }).click()
  await expect(page.locator(".ficha-card-nome")).toHaveText("Arin atualizado")
  await expect(page.locator(".fichas-lista-section")).toBeVisible()
  expect(api.errors).toEqual([])
})

test("retorna a ficha quando o salvamento falha ao navegar", async ({ page }) => {
  const api = await prepare(page)
  await openSheet(page)
  api.failSave = true
  await page.locator('[x-model="form.nome"]').fill("Edicao pendente")
  await page.getByRole("navigation").getByRole("button", { name: "Personagens", exact: true }).click()
  await expect.poll(() => api.saves.length).toBe(1)
  await expect(page).toHaveURL(sheetURL)
  await expect(page.locator('[x-model="form.nome"]')).toHaveValue("Edicao pendente")
  await expect(page.locator(".character-page-wrapper")).toBeVisible()
  api.failSave = false
  await page.locator(".t20-exit-sheet").click()
  await expect(page.locator(".fichas-lista-section")).toBeVisible()
  expect(api.errors).toEqual([])
})

test("carregamento atrasado nao reabre a ficha depois de sair", async ({ page }) => {
  const api = await prepare(page)
  let release
  api.waitForEquipment = new Promise(resolve => { release = resolve })
  await page.goto("/personagens")
  await page.locator(".ficha-card-action--open").click()
  await expect(page).toHaveURL(sheetURL)
  await page.getByRole("navigation").getByRole("button", { name: "Personagens", exact: true }).click()
  await expect(page.locator(".fichas-lista-section")).toBeVisible()
  release()
  await expect.poll(() => page.evaluate(() => Alpine.$data(document.querySelector('[x-data="character"]')).selectedCharId)).toBeNull()
  await expect(page).toHaveURL("/personagens")
  expect(api.errors).toEqual([])
})

test("rotas invalidas e fichas sem personagem tem destino visivel", async ({ page }) => {
  const api = await prepare(page)
  for (const path of ["/personagens/ficha", "/personagens/ficha/pericias?id=ausente"]) {
    await page.goto(path)
    await expect(page).toHaveURL("/personagens")
    await expect(page.locator(".fichas-lista-section")).toBeVisible()
  }
  await page.goto("/rota-inexistente")
  await expect(page).toHaveURL("/inicio")
  await expect(page.locator(".landing")).toBeVisible()
  expect(api.errors).toEqual([])
})

test("navega entre paginas, campanhas e secoes com voltar e avancar", async ({ page, isMobile }) => {
  const api = await prepare(page)
  await openSheet(page)
  for (const section of ["inventario", "magias", "habilidades", "descricao", "ataques", "historico"]) {
    if (isMobile) {
      await page.locator(".t20-dock-menu-btn").click()
      await page.locator(".t20-section-menu-item").nth(["pericias", "inventario", "magias", "habilidades", "descricao", "ataques", "historico"].indexOf(section)).click()
    } else {
      await page.locator(`.t20-tab[x-on\\:click="openFichaSection('${section}')"]`).click()
    }
    await expect(page).toHaveURL(`/personagens/ficha/${section}?id=101`)
    await expect(page.locator(".character-page-wrapper")).toBeVisible()
  }
  await page.goBack()
  await expect(page).toHaveURL("/personagens/ficha/ataques?id=101")
  for (const [name, path, selector] of [["Campanhas", "/campanhas/minhas", ".campaign-section"], ["Mestre", "/mestre", ".master-section"], ["Referência", "/referencia", ".reference-section"], ["Início", "/inicio", ".landing"]]) {
    await page.getByRole("navigation").getByRole("button", { name, exact: true }).click()
    await expect(page).toHaveURL(path)
    await expect(page.locator(selector)).toBeVisible()
  }
  await page.getByRole("navigation").getByRole("button", { name: "Campanhas", exact: true }).click()
  await page.locator('[x-on\\:click="setTab(\'join\')"]').click()
  await expect(page).toHaveURL("/campanhas/entrar")
  await page.goBack()
  await expect(page.locator(".campaign-tabs button").first()).toHaveClass(/active/)
  await page.getByRole("navigation").getByRole("button", { name: "Configurações", exact: true }).click()
  await page.getByRole("navigation").getByRole("button", { name: /Meus dados/ }).click()
  await expect(page).toHaveURL("/perfil")
  await expect(page.locator(".profile-section")).toBeVisible()
  expect(api.errors).toEqual([])
})

test("protege as rotas e usa x-link entre login e cadastro", async ({ page }) => {
  const api = await prepare(page, { authenticated: false })
  await page.goto("/personagens/ficha/pericias?id=101")
  await expect(page).toHaveURL("/")
  await page.getByRole("link", { name: "Cadastre-se" }).click()
  await expect(page).toHaveURL("/cadastro")
  await page.getByRole("link", { name: "Entrar", exact: true }).click()
  await expect(page).toHaveURL("/")
  expect(api.errors).toEqual([])
})

test("abre a ficha enviada pelo painel do mestre", async ({ page }) => {
  const api = await prepare(page)
  await page.goto("/mestre")
  await expect(page.locator(".master-section")).toBeVisible()
  await expect.poll(() => page.evaluate(() => Alpine.store("auth").authenticated)).toBe(true)
  await page.evaluate(ficha => {
    Alpine.$data(document.querySelector('[x-data="master"]')).editFicha(ficha)
  }, { ...api.ficha, id: 202, nomePersonagem: "Ficha da campanha" })
  await expect(page).toHaveURL("/personagens/ficha/pericias?id=202")
  await expect(page.locator('[x-model="form.nome"]')).toHaveValue("Ficha da campanha")
  await expect(page.locator(".character-page-wrapper")).toBeVisible()
  expect(api.errors).toEqual([])
})

test("expirar sessao com edicao pendente nao causa ciclo de redirecionamento", async ({ page }) => {
  const api = await prepare(page)
  await openSheet(page)
  await page.locator('[x-model="form.nome"]').fill("Edicao local")
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("grimorio:unauthorized")))
  await expect(page).toHaveURL("/")
  await expect(page.locator(".auth-page").first()).toBeVisible()
  await expect.poll(() => page.evaluate(() => Alpine.$data(document.querySelector('[x-data="character"]')).selectedCharId)).toBeNull()
  expect(api.saves).toHaveLength(0)
  expect(api.errors).toEqual([])
})

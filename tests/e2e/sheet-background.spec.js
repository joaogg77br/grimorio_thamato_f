import { test, expect } from "@playwright/test"

const gif = Buffer.from(
  "47494638396101000100800000ff00000000ff21ff0b4e45545343415045322e300301000000" +
  "21f904000a0000002c0000000001000100000202440100" +
  "21f904000a0000002c00000000010001000002024c01003b",
  "hex",
)

async function openSheet(page) {
  const errors = []
  page.on("pageerror", error => errors.push(error.message))
  await page.routeWebSocket(/grimorioback/, socket => socket.close())
  await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("grimorio_session", JSON.stringify({
      user: { id: "gif-user", name: "Jogador", email: "gif@example.test" },
      token: "test-token",
    }))
    localStorage.setItem("grimorio_sound", "off")
  })
  await page.route(/\/logged|\/todasAsFichas\/|\/equipamentos\/|\/magias\/|\/habilidades\/|\/pericias\/|\/historico\//, route => {
    const path = new URL(route.request().url()).pathname
    const ficha = { id: 101, nomePersonagem: "Arin", nomeJogador: "Jogador", raca: "Humano", classe: "Guerreiro", nivel: 1 }
    return route.fulfill({ json: path.includes("/todasAsFichas/") ? { data: [ficha] } : { success: true, data: [], pericias: [], historico: [] } })
  })
  await page.goto("/personagens/ficha/pericias?id=101")
  await expect(page.locator('[x-model="form.nome"]')).toBeEditable()
  await page.getByRole("button", { name: "Configurações", exact: true }).click()
  await expect(page.locator("#sheet-background-file")).toBeEnabled()
  return errors
}

test("exibe GIF animado acima de 4 MB, restaura e remove o fundo", async ({ page }, testInfo) => {
  const errors = await openSheet(page)
  const file = Buffer.concat([gif, Buffer.alloc(5 * 1024 * 1024)])
  await page.locator("#sheet-background-file").setInputFiles({ name: "animado.gif", mimeType: "image/gif", buffer: file })
  const image = page.locator(".character-background-image")
  await expect(image).toBeVisible()
  await expect(image).toHaveAttribute("src", /^blob:/)
  await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
  expect(await image.evaluate(async img => (await (await fetch(img.src)).blob()).size)).toBe(file.length)
  await page.getByRole("button", { name: "Configurações", exact: true }).click()
  const clip = { x: 2, y: Math.floor(page.viewportSize().height / 2), width: 8, height: 8 }
  const frame = await page.screenshot({ clip, animations: "allow" })
  await expect.poll(async () => (await page.screenshot({ clip, animations: "allow" })).equals(frame), { intervals: [70, 130, 170] }).toBe(false)
  await page.screenshot({ path: testInfo.outputPath("gif-ficha.png") })
  await page.reload()
  await expect(image).toBeVisible()
  await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
  await page.locator(".t20-exit-sheet").click()
  await expect(image).toHaveCount(0)
  await page.locator(".ficha-card-action--open").click()
  await expect(image).toBeVisible()
  await page.getByRole("button", { name: "Configurações", exact: true }).click()
  await page.getByRole("button", { name: /Remover fundo/ }).click()
  await expect(image).toHaveCount(0)
  await page.reload()
  await expect(page.locator("#sheet-background-file")).toBeEnabled()
  await expect(image).toHaveCount(0)
  expect(errors).toEqual([])
})

test("preserva o fundo anterior quando o GIF e invalido ou o armazenamento falha", async ({ page }) => {
  const errors = await openSheet(page)
  const input = page.locator("#sheet-background-file")
  await input.setInputFiles({ name: "animado.gif", mimeType: "image/gif", buffer: gif })
  const image = page.locator(".character-background-image")
  await expect(image).toBeVisible()
  const original = await image.getAttribute("src")
  await input.setInputFiles({ name: "invalido.gif", mimeType: "image/gif", buffer: Buffer.from("invalid") })
  await expect(page.getByText(/Não foi possível carregar ou salvar o fundo/)).toBeVisible()
  await expect(image).toHaveAttribute("src", original)
  await expect(input).toBeEnabled()
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Sem espaço", "QuotaExceededError")
    }
  })
  await input.setInputFiles({ name: "outro.gif", mimeType: "image/gif", buffer: gif })
  await expect(input).toBeEnabled()
  await expect(image).toHaveAttribute("src", original)
  expect(errors).toEqual([])
})

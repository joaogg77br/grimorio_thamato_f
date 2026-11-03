import { describe, expect, it, vi } from "vitest"
import armas from "../armas-tormenta20.json"
import equipamentos from "../equipamentos-tormenta20.json"
import protecoes from "../protecoes-tormenta20.json"
import classes from "../classes-tormentaUPLEVEL20.json"
import evolucao from "../tabela-evolucao-classes-tormenta20.json"
import origens from "../origens-tormenta20.json"
import deuses from "../deuses-tormenta20.json"
import racas from "../racas-tormenta20.json"
import poderes from "../habilidades-gerais-tormenta20.json"
import habilidades from "../habilidades-classes-tormenta20.json"
import habilidadesOrigens from "../habilidades-origens-tormenta20.json"
import habilidadesRacas from "../habilidades-racas-tormenta20.json"
import magias from "../magias-tormenta20.json"
import condicoes from "../condicoes-tormenta20.json"
import pericias from "../pericias-tormenta20.json"
import { parseDiceFormula } from "../src/components/dice/dice.js"
import { limparEmojiRaca } from "../src/data/racas.js"
import { createCharacter } from "./helpers/character.js"

vi.mock("../src/useApi/index.js")
vi.mock("socket.io-client", () => ({ io: vi.fn(() => ({ on: vi.fn(), emit: vi.fn() })) }))

const catalogos = { armas, equipamentos, protecoes, classes, origens, deuses, racas, poderes, habilidades, habilidadesOrigens, habilidadesRacas, magias, pericias }
const normalizar = nome => nome.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
const nomeEm = (lista, nome) => lista.find(item => item.nome === nome)

describe("Catálogos auditados com a prévia de maio de 2020", () => {
  it.each(Object.entries(catalogos))("mantém identidade única e procedência em %s", (nome, lista) => {
    const ids = lista.map(item => `${item.classe || ""}/${item.nome || item.classe}`)
    expect(new Set(ids).size).toBe(lista.length)
    for (const item of lista) {
      if (item.fonte === null) {
        expect(item.verificacao).toContain("sem validação")
      } else {
        expect(item.fonte.edicao).toBe("Prévia de maio de 2020")
        expect(item.fonte.paginaPdf).toBe(item.fonte.pagina + 2)
      }
      if (nome !== "classes") expect(item.descricao.trim().length).toBeGreaterThan(15)
    }
  })

  it("inclui as armas ausentes e fornece fórmulas aceitas pelo rolador", () => {
    for (const nome of ["Arco longo", "Besta pesada", "Chicote", "Espada bastarda", "Katana", "Machado anão", "Corrente com cravos", "Machado táurico", "Munição (10)", "Rede"]) {
      expect(nomeEm(armas, nome)).toBeDefined()
    }
    for (const arma of armas) expect(() => parseDiceFormula(arma.dadoDeDano)).not.toThrow()
    expect(nomeEm(armas, "Pistola")).toMatchObject({ tipoArma: "Arma de Fogo", critico: 19, multiplicador: 3 })
    expect(nomeEm(armas, "Besta pesada")).toMatchObject({ dadoDeDano: "1d12", recarga: "Ação padrão" })
    expect(nomeEm(armas, "Espada bastarda")).toMatchObject({ dadoDeDano: "1d10", danos_alternativos: ["1d10", "1d12"] })
    expect(nomeEm(armas, "Bordão")).toMatchObject({ dadoDeDano: "1d6", dano_tabela: "1d6/1d6" })
    expect(nomeEm(armas, "Alabarda").descricao).toContain("não permite atacar um adversário adjacente")
  })

  it("distingue dados não informados de valores gratuitos", () => {
    expect(nomeEm(equipamentos, "Água benta")).toMatchObject({ preco: null, peso: null })
    expect(nomeEm(equipamentos, "Essência de mana").preco).toBe(50)
    expect(nomeEm(armas, "Clava").preco).toBe(0)
    expect(nomeEm(protecoes, "Armadura completa")).toMatchObject({ preco: 3000, bonusDefesa: 10, penalidadeArmadura: -5 })
  })

  it("relaciona todos os poderes concedidos às divindades correspondentes", () => {
    for (const deus of deuses) {
      expect(deus.poderes_concedidos.length).toBeGreaterThanOrEqual(3)
      expect(deus.poderes_concedidos.length).toBeLessThanOrEqual(4)
      expect(deus.devotos_permitidos).toBeTruthy()
      expect(deus.arma_preferida).toBeTruthy()
      for (const nome of deus.poderes_concedidos) {
        const poder = poderes.find(item => normalizar(item.nome) === normalizar(nome))
        expect(poder, `${deus.nome}: ${nome}`).toBeDefined()
        expect([...(poder.divindades || []), ...(poder.divindades_mencionadas_em_listas || [])]).toContain(deus.nome)
      }
    }
    expect(nomeEm(poderes, "Dom da Verdade").observacoes).toContain("Inconsistência da prévia")
    expect(nomeEm(deuses, "Thyatis").poderes_atribuidos_por_descricao).toContain("Dom da Ressurreição")
  })

  it("relaciona cada origem ao seu poder e mantém exceções de escolha", () => {
    expect(origens).toHaveLength(35)
    for (const origem of origens) {
      expect(origem.itens).toBeTruthy()
      expect(origem.beneficios).toBeTruthy()
      expect(habilidadesOrigens.find(hab => hab.nome === origem.poder_unico && hab.origem === origem.nome)).toBeDefined()
    }
    expect(nomeEm(origens, "Amnésico").regra_escolhas).toContain("escolhidos pelo mestre")
    expect(nomeEm(habilidadesOrigens, "Membro da Igreja").descricao).toContain("hospedagem e informação")
    expect(nomeEm(habilidadesOrigens, "À Prova de Tudo")).toMatchObject({ gastoPe: null })
  })

  it("mantém habilidades raciais iguais no catálogo e na criação da ficha", () => {
    for (const raca of racas) {
      const nome = limparEmojiRaca(raca.nome).split(" - ")[0]
      for (const hab of raca.habilidades) {
        expect(habilidadesRacas.find(item => item.classe === `Raça (${nome})` && item.nome === hab.nome)?.descricao).toBe(hab.descricao)
      }
    }
    const golem = racas.find(item => limparEmojiRaca(item.nome) === "Golem")
    expect(golem.sem_origem).toBe(true)
    expect(nomeEm(golem.habilidades, "Espírito Elemental").descricao).toContain("metade do dano")
    expect(nomeEm(golem.habilidades, "Sem Origem")).toBeDefined()
  })

  it("inclui círculos, resistências, truques e aprimoramentos das magias", () => {
    expect(magias).toHaveLength(198)
    expect(nomeEm(magias, "Explosão de Chamas")).toMatchObject({ alcance: "6m", gastoPe: 1, resistencia: "Reflexos reduz à metade" })
    expect(nomeEm(magias, "Explosão de Chamas").truque).toContain("acender uma vela")
    expect(nomeEm(magias, "Adaga Mental").aprimoramentos.length).toBeGreaterThanOrEqual(3)
    expect(nomeEm(magias, "Visão da Verdade").alcance).toBe("pessoal")
    expect(nomeEm(magias, "Deflagração de Mana").duracao).toBeNull()
    for (const magia of magias) {
      expect(magia.gastoPe).toBe([0, 1, 3, 6, 10, 15][Number(magia.Circulo[0])])
      expect(magia.escola).toBeTruthy()
      for (const aprimoramento of magia.aprimoramentos) expect(aprimoramento.descricao).toBeTruthy()
    }
  })

  it("preserva níveis, pré-requisitos e opções que faltavam nas classes", () => {
    expect(habilidades.find(h => h.classe === "Arcanista" && h.nome === "Fluxo de Mana").pre_requisitos).toContain("10º nível")
    expect(nomeEm(habilidades, "Linhagem Dracônica").descricao).toContain("Aprimorada")
    expect(nomeEm(habilidades, "Forma Feroz").descricao).toContain("4d6")
    expect(nomeEm(habilidades, "Golpe Pessoal").efeitos).toHaveLength(16)
    expect(habilidades.find(h => h.classe === "Paladino" && h.nome === "Montaria Sagrada").descricao).toContain("17º nível")
    expect(classes.find(c => c.classe === "Nobre").pericias_treinadas_alternativas).toEqual([["Diplomacia", "Intimidação"]])
    for (const classe of classes) {
      const tabela = evolucao.find(item => item.classe === classe.classe)
      expect(tabela.tabela_evolucao).toHaveLength(20)
      for (const linha of tabela.tabela_evolucao) expect(linha.habilidades_obtidas).toBe(classe.progressao[linha.nivel])
    }
  })

  it("identifica as condições como conteúdo do playtest anexado", () => {
    expect(Object.keys(condicoes)).toHaveLength(32)
    expect(condicoes.confuso.efeitos_e_penalidades).toContain("apenas role o dano")
    expect(condicoes.sangrando.efeitos_e_penalidades).toContain("remove essa condição")
    expect(condicoes.surdo.fonte).toMatchObject({ pagina: 161, paginaPdf: 293 })
    expect(condicoes.surdo.fonte.edicao).toContain("Playtest")
  })

  it.each([["Lefou", "CAR", "Carisma"], ["Osteon", "CON", "Constituição"]])("aplica a penalidade fixa e a exclusão de %s", (raca, chave, atributo) => {
    const state = createCharacter()
    state.escolherRaca(racas.find(item => limparEmojiRaca(item.nome) === raca))
    state.alternarRacialEscolha(chave)
    expect(state.wizardRacialChoices).toEqual([])
    expect(state.wizardValorFinal(chave)).toBe(8)
    expect(state.wizardRaca.atributos_escolha.excluidos).toContain(atributo)
    for (const key of ["FOR", "DES", "INT"]) state.alternarRacialEscolha(key)
    expect(state.wizardValorFinal("FOR")).toBe(12)
    expect(state.wizardRacialEscolhaCompleta).toBe(true)
  })

  it("oferece as origens e divindades auditadas na ficha", () => {
    const state = createCharacter()
    expect(state.ORIGENS).toContain("Amnésico")
    expect(state.ORIGENS).toContain("Circense")
    expect(state.DIVINDADES).toContain("Thwor")
    expect(state.DIVINDADES).not.toContain("Glórienn")
    expect(state.CLASSES).toHaveLength(14)
  })
})

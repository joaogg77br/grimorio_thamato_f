const marcadorMagia = () => /(Truque|\+\s*\d+\s*PM)(?:\s*\(([^)]*)\))?\s*:/giu

function normalizarOpcao(opcao, indice) {
  const descricao = String(opcao.descricao || "").trim()
  const requisitos = Array.isArray(opcao.requisitos) ? opcao.requisitos : descricao.match(/\bRequer\s+[^.]+\./gu) || []
  const circulo = descricao.match(/\bRequer\s+(\d+)[º°o]?\s*círculo/iu)
  return {
    ...opcao,
    ordem: opcao.ordem ?? indice + 1,
    custoAdicional: Number(opcao.custoAdicional) || 0,
    restricao: opcao.restricao || null,
    requisitos,
    circuloMinimo: opcao.circuloMinimo ?? (circulo ? Number(circulo[1]) : null),
    descricao,
    efeito: requisitos.reduce((texto, requisito) => texto.replace(requisito, ""), descricao).replace(/\s{2,}/gu, " ").trim(),
  }
}

function detalhesMagia(magia = {}) {
  const texto = String(magia.descricao || "")
  const marcadores = [...texto.matchAll(marcadorMagia())]
  const aprimoramentos = []
  const truques = []
  for (const [indice, marcador] of marcadores.entries()) {
    const truque = marcador[1].toLocaleLowerCase("pt-BR") === "truque"
    const opcao = normalizarOpcao({
      ordem: indice + 1,
      custoAdicional: truque ? 0 : Number(marcador[1].match(/\d+/u)[0]),
      restricao: marcador[2],
      descricao: texto.slice(marcador.index + marcador[0].length, marcadores[indice + 1]?.index ?? texto.length),
    }, indice)
    if (truque) truques.push(opcao)
    else aprimoramentos.push(opcao)
  }
  if (!truques.length && magia.truque) truques.push(normalizarOpcao({ descricao: magia.truque }, 0))
  return {
    descricaoBase: magia.descricaoBase ?? (marcadores.length ? texto.slice(0, marcadores[0].index).trim() : texto),
    aprimoramentos: Array.isArray(magia.aprimoramentos) ? magia.aprimoramentos.map(normalizarOpcao) : aprimoramentos,
    truques: Array.isArray(magia.truques) ? magia.truques.map(normalizarOpcao) : truques,
  }
}

function serializarDescricaoMagia(magia) {
  const detalhes = detalhesMagia(magia)
  const opcoes = [
    ...detalhes.aprimoramentos.map(opcao => ({ ...opcao, rotulo: `+${opcao.custoAdicional} PM${opcao.restricao ? ` (${opcao.restricao})` : ""}` })),
    ...detalhes.truques.map(opcao => ({ ...opcao, rotulo: "Truque" })),
  ].sort((a, b) => a.ordem - b.ordem)
  return [detalhes.descricaoBase, ...opcoes.map(opcao => `${opcao.rotulo}: ${opcao.descricao}`)].filter(Boolean).join(" ")
}

export { detalhesMagia, serializarDescricaoMagia }

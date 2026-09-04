import racas from "../../racas-tormenta20.json"

const limparEmojiRaca = (nome) => String(nome || '').replace(/^\p{Extended_Pictographic}\s*/u, '').trim()

const adicionarEmojiRaca = (nome) => {
  const alvo = limparEmojiRaca(nome).toLowerCase()
  const r = racas.find(x => limparEmojiRaca(x.nome).toLowerCase() === alvo)
  return r ? r.nome : nome
}

export default racas
export { limparEmojiRaca, adicionarEmojiRaca }
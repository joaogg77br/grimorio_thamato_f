import racas from "../../racas-tormenta20.json"
import { limparEmojiClasse } from "./classes.js"

const limparEmojiRaca = limparEmojiClasse

const adicionarEmojiRaca = (nome) => {
  const alvo = limparEmojiRaca(nome).toLowerCase()
  const r = racas.find(x => limparEmojiRaca(x.nome).toLowerCase() === alvo)
  return limparEmojiRaca(r ? r.nome : nome)
}

export default racas
export { limparEmojiRaca, adicionarEmojiRaca }

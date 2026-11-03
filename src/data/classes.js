const limparEmojiClasse = (nome) => String(nome || "")
  .replace(/^(?:\s*(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?\p{Emoji_Modifier}?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?\p{Emoji_Modifier}?)*|\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3)\s*)+/u, "")
  .trim()

export { limparEmojiClasse }

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

// 处理{{ ... }}中内容
export function parseText (text){
  const tagRE = defaultTagRE
  if (!tagRE.test(text)) {
    return
  }
  const tokens = [] // 收集依赖表达式
  const rawTokens = []  // 收集依赖
  let lastIndex = tagRE.lastIndex = 0
  let match, index, tokenValue
  while ((match = tagRE.exec(text))) {
    index = match.index
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index))
      tokens.push(JSON.stringify(tokenValue))
    }
    const exp = match[1].trim()
    tokens.push(`_s(${exp})`)
    rawTokens.push({ '@binding': exp })
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex))
    tokens.push(JSON.stringify(tokenValue))
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}

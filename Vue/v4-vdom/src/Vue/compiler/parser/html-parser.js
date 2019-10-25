import { makeMap, no } from '../../util'

// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t',
  '&#39;': "'"
}
const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g

function decodeAttr (value) {
  const re = encodedAttr
  return value.replace(re, match => decodingMap[match])
}

export function parseHTML (html, options) {
  const stack = []  // 已经打开的标签堆栈
  let index = 0 // 已匹配到模版字符串的位置
  let last  // 尚未匹配的模版字符串
  while (html) {
    last = html

    let textEnd = html.indexOf('<')
    if (textEnd === 0) {

      // 闭合标签
      const endTagMatch = html.match(endTag)
      if (endTagMatch) {
        const curIndex = index
        // 记录已匹配到的位置
        advance(endTagMatch[0].length)
        // 处理闭合标签
        parseEndTag(endTagMatch[1], curIndex, index)
        continue
      }

      // 开始标签
      const startTagMatch = parseStartTag()
      if (startTagMatch) {
        handleStartTag(startTagMatch)
        continue
      }
    }

    let text, rest, next
    if (textEnd >= 0) {
      rest = html.slice(textEnd)
      while (
        !endTag.test(rest) &&
        !startTagOpen.test(rest)
      ) {
        // 文本中出现<
        next = rest.indexOf('<', 1)
        if (next < 0) break
        textEnd += next
        rest = html.slice(textEnd)
      }
      // 截除非标签文本至下一个开始或结束标签
      text = html.substring(0, textEnd)
    }
    if (textEnd < 0) {
      // 模版中不存在<
      text = html
    }

    if (text) {
      // 记录非标签文本长度
      advance(text.length)
    }

    if (options.chars && text) {
      // 处理非标签内文本
      options.chars(text)
    }
    if (html === last) {
      // 处理非标签内文本，仅当存在不正确的结束标签
      options.chars && options.chars(html)
      break
    }
  }

  // 当存在不正确的结束标签，需清理打开的标签
  parseEndTag()

  // 记录匹配到的位置，截取对应模版
  function advance (n) {
    index += n
    html = html.substring(n)
  }

  function parseStartTag () {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
        start: index
      }
      advance(start[0].length)
      let end, attr
      // 截取属性
      while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
        attr.start = index
        advance(attr[0].length)
        attr.end = index
        match.attrs.push(attr)
      }
      if (end) {
        match.unarySlash = end[1] // 是否为单标签
        advance(end[0].length)
        match.end = index
        return match
      }
    }
  }

  function handleStartTag (match) {
    const tagName = match.tagName
    const unarySlash = match.unarySlash

    const unary = !!unarySlash

    const l = match.attrs.length
    const attrs = new Array(l)
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i]
      const value = args[3] || args[4] || args[5] || ''
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value)
      }
    }

    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end })
    }

    if (options.start) {
      options.start(tagName, attrs, unary)
    }
  }

  function parseEndTag (tagName, start, end) {
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index

    // 找到最近打开相同标签
    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // 如果没有提供标签名称，清理stack
      pos = 0
    }

    if (pos >= 0) {
      for (let i = stack.length - 1; i >= pos; i--) {
        if (options.end) {
          options.end()
        }
      }
      stack.length = pos
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true)
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false)
      }
      if (options.end) {
        options.end()
      }
    }
  }
}

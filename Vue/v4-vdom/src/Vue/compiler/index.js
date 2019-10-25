/* @flow */

import { parse } from './parser/index'
import { generate } from './codegen/index'

export function createCompiler (template) {
  const ast = parse(template.replace(/\n/g, '')) // 模版编译成AST
  const code = generate(ast) // 利用AST生成render字符串
  return {
    ast,
    render: code.render,
    renderFn: new Function(code.render)
  }
}

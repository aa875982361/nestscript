const acorn = require("acorn")
const jsx = require("acorn-jsx");
const parse = acorn.parse
const jsxParser = acorn.Parser.extend(jsx())
const walk = require("acorn-walk")
const escodegen = require('escodegen');//JS语法树反编译模块

function addDataStrInExpression(str: string): string {
  const ast = acorn.parse(str)
  handleAst(ast)

  // console.log("ast", ast.body[0].expression);
  const generateCode  = escodegen.generate(ast, {}).replace(/;/g, "")
  // console.log("escodegen", generateCode);
  return generateCode
}

/**
 * 处理ast树，加上data.的字符串
 * @param ast 
 */
function handleAst(ast: any){
  walk.ancestor(ast, {
    Identifier(node: any) {
      // console.log("this Identifier ", node);
      const oldNode = Object.assign({}, node)
      node.type = "MemberExpression",
      node.property = oldNode,
      node.object = {
        type: 'Identifier',
        name: 'data'
      }
    }
  })
}

export default addDataStrInExpression

// -------- test 测试代码 -----
// addDataStrInExpression("myclass")
// addDataStrInExpression("false")
// addDataStrInExpression("1")
// addDataStrInExpression("item.type + 'xxx'")
// addDataStrInExpression("'xxxx' + item.name.show + item.name")

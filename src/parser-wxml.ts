/**
 * 处理wxml 的表达式分为两个阶段
 * 编译阶段 
 *  1. 将含有表达的字符串统一用function替代
 * 运行阶段
 *  1. 将function执行，得到字符串
 */
 import * as path from "path"
 import * as fs from "fs"
const himalay = require("himalaya")
const addDataStrInExpression = require("./addDataStrInExpression").default
interface VDom {
  type: string,
  tagName: string,
  attributes?: Attribute[],
  children?: VDom[],
  content?: string,
}

interface Attribute {
  key: string,
  value: string
}

const isTest = true;
const allExpressStrMap = new Map()

export default function(wxmlPath: string, targetPath?: string): string{
  if(!wxmlPath){
    if(isTest){
      wxmlPath = path.join(__dirname, '../example/main.wxml')
      targetPath = path.join(__dirname, "../example/main.render.js")
    }else{
      throw new Error("请输入wxml地址")
    }
  }
  const html = fs.readFileSync(wxmlPath, {encoding: 'utf8'})
  const json: VDom[] = himalay.parse(html)
  // 编译处理wxml 处理含有表达式的字符串 
  compileFunction(json, {})
  // 转换wxml ast树为json字符串 因不可转换函数，固将函数用特定key替代
  let templateJson: any = JSON.stringify(json, null, 2) || ""
  // 将特定key 转化为函数
  templateJson = templateJson.replace(/\"(\d{22})\"/g, (all: string, key: string) => {
    if(allExpressStrMap.has(key)){
      return allExpressStrMap.get(key)
    }
    return all
  })
  // 拿到模板渲染json
  
  // console.log("templateJson",templateJson);
  
  /**
   * 根据渲染模板构建渲染函数，生成一个运行时函数，可以根据 页面data 生成页面渲染节点
   */
  const renderFunctionStr = `
  const templateVDomCreateList = ${templateJson};
  /**
   * 根据data 构造渲染结果
   * @param data 
   */
  function renderFunction(data = {}){
    // 遍历节点 将属性值为函数的都执行一遍 获得渲染结果
    const newVdoms = walkTemplateDoms(templateVDomCreateList, data)
    console.log("newVdoms", JSON.stringify(newVdoms, null, 2));
    return newVdoms
  }
  
  /**
   * 根据构建模板和数据构建出一颗渲染树
   * @param vdomList 
   * @param data 
   */
  function walkTemplateDoms(vdomList = [], data = {}){
    const len = vdomList.length
    // 建立新的vdom 节点数组
    const newVDoms = []
    for(let i = 0; i < len; i++){
      // 取出遍历的节点
      const vdom = vdomList[i];
      // 浅复制一遍属性到新的对象上
      const newVDom = {...vdom}
      // 如果是文本类型 则content有可能存在表达式
      if(newVDom.type === "text"){
        if(typeof vdom.content === "function"){
          newVDom.content = vdom.content(data)
        }
      }else{
        // 遍历属性
        const attributes = vdom.attributes || []
        newVDom.attributes = walkTemplateAttributes(attributes, data)
        // 遍历子节点
        const children = vdom.children || []
        newVDom.children = walkTemplateDoms(children, data)
      }
      // 将复制出来的节点放到新列表上
      newVDoms.push(newVDom)
    }
    return newVDoms
  }
  
  /**
   * 遍历节点的属性值 将value值是function的先执行
   * @param attributes 属性数组
   * @param data 数据
   * @returns 新的属性数组
   */
  function walkTemplateAttributes(attributes = [], data = {}){
    const len = attributes.length;
    // 构建新的数组存储属性
    const newAttributes = []
    for(let i = 0; i < len; i++){
      const attribute = attributes[i]
      // 浅复制一遍
      const newAttribute = Object.assign({}, attribute)
      if(typeof attribute.value === "function"){
        newAttribute.value = attribute.value(data)
      }
      newAttributes.push(newAttribute)
    }
    return newAttributes
  }
  `;
  if(targetPath){
    fs.writeFileSync(targetPath, renderFunctionStr, {encoding: 'utf8'})
  }
  return renderFunctionStr
  
  // const build = require("../rollup.js")
  // build.then((res: any)=>{
  //   console.log("执行完成");
  // })
}


let templateVDomCreateList: object[] = []
/**
 * 根据data 构造渲染结果
 * @param data 
 */
function renderFunction(data: any){
  // 遍历节点 将属性值为函数的都执行一遍 获得渲染结果
  const newVdoms = walkTemplateDoms(templateVDomCreateList, data)
}

/**
 * 根据构建模板和数据构建出一颗渲染树
 * @param vdomList 
 * @param data 
 */
function walkTemplateDoms(vdomList: object[], data: object){
  const len = vdomList.length
  // 建立新的vdom 节点数组
  const newVDoms = []
  for(let i = 0; i < len; i++){
    // 取出遍历的节点
    const vdom: any = vdomList[i];
    // 浅复制一遍属性到新的对象上
    const newVDom = {...vdom}
    // 如果是文本类型 则content有可能存在表达式
    if(newVDom.type === "text"){
      if(typeof vdom.content === "function"){
        newVDom.content = vdom.content(data)
      }
    }else{
      // 遍历属性
      const attributes = vdom.attributes || []
      newVDom.attributes = walkTemplateAttributes(attributes, data)
      // 遍历子节点
      const children = vdom.children || []
      newVDom.children = walkTemplateDoms(children, data)
    }
    // 将复制出来的节点放到新列表上
    newVDoms.push(newVDom)
  }
  return newVDoms
}

/**
 * 遍历节点的属性值 将value值是function的先执行
 * @param attributes 属性数组
 * @param data 数据
 * @returns 新的属性数组
 */
function walkTemplateAttributes(attributes: Attribute[], data: any): Attribute[]{
  const len = attributes.length;
  // 构建新的数组存储属性
  const newAttributes: Attribute[] = []
  for(let i = 0; i < len; i++){
    const attribute: Attribute = attributes[i]
    // 浅复制一遍
    const newAttribute = Object.assign({}, attribute)
    if(typeof attribute.value === "function"){
      newAttribute.value = (attribute as any).value(data)
    }
  }
  return newAttributes
}




/**
 * 编译渲染页面
 * @param vdoms 虚拟式节点
 * @param data 页面数据
 */
function compileFunction(vdoms: VDom[], data: object){
  // 深度遍历页面节点 主要是处理含有表达式的文本和属性值
  walkVDoms(vdoms, data)
}


function walkVDoms(vdoms: VDom[], data: object){
  const len = vdoms.length
  const newVDoms: VDom[] = []
  for(let i = 0; i < len; i++){
    const vdom: VDom = vdoms[i];
    if(vdom.type === "text"){
      vdom.content = handleExpressionStr(vdom.content || "")
      if(vdom.content){
        newVDoms.push(vdom)
      }
      continue
    }
    // 遍历属性
    const attributes = vdom.attributes || []
    walkAttributes(attributes, data)
    // 遍历子节点
    const children = vdom.children || []
    vdom.children = walkVDoms(children, data)
    newVDoms.push(vdom)
  }
  return newVDoms
}

/**
 * 遍历属性
 * @param attributes 
 * @param data 
 */
function walkAttributes(attributes: Attribute[], data: any){
  const len = attributes.length ;
  for(let i = 0; i < len; i++){
    const attribute: Attribute = attributes[i]
    attribute.value = handleExpressionStr(attribute.value)
  }
}
/**
 * 处理可能含有表达式的字符
 * @param expressionStr 可能含有表达式的字符
 */
function handleExpressionStr(expressionStr: string): string {
  expressionStr = expressionStr.replace(/(\n| )/g, "")
  const list = expressionStr.match(/\{\{(.*?)\}\}/g);
  if(list && list.length > 0){
    console.log("我含有表达式", expressionStr);
    // 目标场景
    // {{xxx}}
    // as {{xxx}}
    // cksa {{xxx}} dsd
    // asd {{xxx}} sda {{zzzz}}
    //((.*?)({{(.*?)}})*)
    // 排查第一种场景 其他都是字符拼接
    console.log("list", list);
    let result = ""
    if(list.length === 1 && expressionStr.indexOf("{{") === 0){
      // console.log("第一种情况");
      result = expressionStr.slice(2, -2)
      result = handleExpressionInner(result)
    }else{
      // console.log("其他情况");
      result  = `"${expressionStr.replace(/\{\{(.*?)\}\}/g, (all, $1)=>{
        // console.log("$1", $1);
        return `"+(${handleExpressionInner($1)})+"`
      })}"`
    }
    // console.log("result", result);
    
    const funcStr = `function (data){
      return ${result}
    }`
    // console.log("funcStr", funcStr);
    const key = getRandomOnlyKey()
    allExpressStrMap.set(key, funcStr)
    return key
  }else{
    // console.log("expressionStr", expressionStr);
  }
  return expressionStr
}

/**
 * 获得唯一的key
 * @returns 
 */
function getRandomOnlyKey(): string {
  const random = 100000000 + Math.random()*100000000 >> 0
  const timeStamp = +new Date()
  const key = "" + timeStamp + "" + random
  // 如果存在
  if(allExpressStrMap.has(key)){
    return getRandomOnlyKey()
  }
  return key
}

/**
 * 处理表达式内部字符 给属性加上data.
 * @param str 
 */
function handleExpressionInner(str: string): string{
  // 情形列举
  // showData= 
  // item.name + 1
  // !!item
  // item['1'].name
  // false
  // 1
  // 'xxx'
  // "xxxxx"
  str = addDataStrInExpression(str)
  
  return str
}
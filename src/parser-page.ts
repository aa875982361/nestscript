import * as path from "path"
import * as fs from "fs"
import parserWxml from "./parser-wxml"
const build = require("../rollup.js")
var process = require('child_process');

// wxml 文件位置
const wxmlPath = path.join(__dirname, "../example/main.wxml")
// 页面js 文件位置
const pageJsPath = path.join(__dirname, "../example/main.page.js")
// 运行时文件位置
const runtimeJsPath = path.join(__dirname, "./page-runtime.js")
// 目标文件位置
const targetJsPath = path.join(__dirname, "../example/page.all.js")
// 转换es5 之后文件位置
const targetEs5JsPath = path.join(__dirname, "../example/page.all.es5.js")

const wxmlJsCode = parserWxml(wxmlPath)
const runtimeJsCode = fs.readFileSync(runtimeJsPath, {encoding: "utf-8"})
const pageJsCode = fs.readFileSync(pageJsPath, {encoding: "utf-8"})

const allJsCode = `
/** 渲染函数 */
${wxmlJsCode}
/** 页面运行时函数 */
${runtimeJsCode}
/** 原有页面处理逻辑 */
${pageJsCode}
`
fs.writeFileSync(targetJsPath, allJsCode, {encoding: "utf-8"})

build({
  input: targetJsPath, 
  output: targetEs5JsPath
}).then(()=>{
  console.log("打包完成", targetEs5JsPath);
  process.exec('cd /Users/plinghuang/plinghuang/project/nestscript && ./nsc/bin/run compile ./example/page.all.es5.js ./example/main',function (error: string) {
      if (error !== null) {
        console.log('exec error: ' + error);
        return
      }
      console.log("编译为二进制文件完成");
      

  });
})

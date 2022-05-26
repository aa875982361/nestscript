import path = require("path");
import fs  = require("fs")
import { generateAssemblyFromJs } from "../src/codegen";

const srcPath = path.join(__dirname, "../example/main.js")
const code = fs.readFileSync(srcPath, { encoding: "utf-8" })
const res = generateAssemblyFromJs(code)
console.log("res", res);

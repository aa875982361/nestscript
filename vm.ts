import fs = require("fs")
import { arrayBufferToString } from './utils'
import { textSpanIntersectsWith } from 'typescript'
/**
 *
 * MOV dest src 赋值给变量
 *
 * ADD d s
 * SUB d s
 * DIV d s
 * MOD d s
 * EXP d power
 * NEG
 * INC
 * DEC
 *
 *
 * AND d s
 * OR ..
 * XOR ..
 * NOT d
 * SHL d count
 * SHR d count
 *
 * JMP label
 * JE op1 op1 label
 * JNE op1 op1 label
 * JG op1 op2 label
 * JL op1 op2 label
 * JGE op1 op2 label
 * JLE op1 op2 label
 * PUSH src
 * POP dest
 * CALL function numArgs
 * RET
 *
 * PAUSE ms
 * EXIT code
 */
export enum I {
 MOV, ADD, SUB, DIV, MOD,
 EXP, NEG, INC, DEC, AND,
 OR, XOR, NOT, SHL, SHR,
 JMP, JE, JNE, JG, JL,
 JGE, JLE, PUSH, POP, CALL, PRINT,
 RET, AUSE, EXIT,
}

export const enum IOperatantType {
  REGISTER,
  GLOBAL,
  NUMBER,
  FUNCTION_INDEX,
  STRING,
  ARG_COUNT,
  RETURN_VALUE,
  ADDRESS,
}

export interface IOperant {
  type: IOperatantType,
  value: any,
  raw?: any,
  index?: any,
}

export const operantBytesSize: { [x in IOperatantType]: number } = {
  [IOperatantType.FUNCTION_INDEX]: 2,
  [IOperatantType.STRING]: 2,

  [IOperatantType.REGISTER]: 2,
  [IOperatantType.GLOBAL]: 2,
  [IOperatantType.ARG_COUNT]: 2,
  [IOperatantType.ADDRESS]: 4,
  [IOperatantType.NUMBER]: 8,
  [IOperatantType.RETURN_VALUE]: 0,
}


export class VirtualMachine {
  /** 指令索引 */
  public ip: number = 0
  /** 当前函数帧基索引 */
  public fp: number = 0
  /** 操作的栈顶 */
  public sp: number = -1

  /** 寄存器 */
  public RET: any // 函数返回寄存器
  public REG: any // 通用寄存器

  /** 函数操作栈 */
  public stack: any[] = []

  constructor (
    public codes: ArrayBuffer,
    public functionsTable: IFuncInfo[],
    public stringsTable: string[],
    public entryFunctionIndex: number,
    public globalSize: number,
  ) {
    // RET
    const globalIndex = globalSize + 1
    this.stack.length = globalIndex + functionsTable[entryFunctionIndex].localSize
    this.sp = this.stack.length - 1
    this.fp  = globalIndex
  }

  // tslint:disable-next-line: no-big-function
  public run(): void {
    let isRunning = true
    let stack = this.stack
    this.ip = this.functionsTable[this.entryFunctionIndex].ip
    console.log("start stack", stack)
    while (isRunning) {
      const op = this.nextOperator()
      // console.log(op)
      switch (op) {
      case I.PUSH: {
        const val = this.nextOperant()
        console.log('push', val)
        stack[++this.sp] = val.value
        break
      }
      case I.EXIT: {
        this.stack = stack = []
        console.log('exit', stack)
        isRunning = false
        break
      }
      case I.CALL: {
        const funcInfo: IFuncInfo = this.nextOperant().value
        const numArgs = this.nextOperant()
        console.log('call', funcInfo, numArgs)
        //            | R3      |
        //            | R2      |
        //            | R1      |
        //            | R0      |
        //      sp -> | fp      | # for restoring old fp
        //            | ip      | # for restoring old ip
        //            | numArgs | # for restoring old sp: old sp = current sp - numArgs - 3
        //            | arg1    |
        //            | arg2    |
        //            | arg3    |
        //  old sp -> | ....    |
        stack[++this.sp] = numArgs.value
        stack[++this.sp] = this.ip
        stack[++this.sp] = this.fp
        // set to new ip and fp
        this.ip = funcInfo.ip
        this.fp = this.sp
        this.sp += funcInfo.localSize
        break
      }
      case I.RET: {
        const fp = this.fp
        this.fp = stack[fp]
        this.ip = stack[fp - 1]
        // 减去参数数量，减去三个 fp ip numArgs
        this.sp = fp - stack[fp - 2] - 3
        // 清空上一帧
        this.stack = stack = stack.slice(0, this.sp + 1)
        console.log('RET', stack)
        break
      }
      case I.PRINT: {
        const val = this.nextOperant()
        console.log(val.value)
        break
      }
      case I.MOV: {
        const dst = this.nextOperant()
        const src = this.nextOperant()
        console.log('mov', dst, src)
        this.stack[dst.index] = src.value
        break
      }
      case I.ADD: {
        const dst = this.nextOperant()
        const src = this.nextOperant()
        console.log('add', dst, src)
        this.stack[dst.index] += src.value
        break
      }
      case I.SUB: {
        const dst = this.nextOperant()
        const src = this.nextOperant()
        console.log('sub', dst, src)
        this.stack[dst.index] -= src.value
        break
      }
      case I.JMP: {
        const address = this.nextOperant()
        this.ip = address.value
        break
      }
      case I.JE: {
        this.jumpWithCondidtion((a: any, b: any): boolean => a === b)
        break
      }
      case I.JNE: {
        this.jumpWithCondidtion((a: any, b: any): boolean => a !== b)
        break
      }
      case I.JG: {
        this.jumpWithCondidtion((a: any, b: any): boolean => a > b)
        break
      }
      case I.JL: {
        this.jumpWithCondidtion((a: any, b: any): boolean => a < b)
        break
      }
      case I.JGE: {
        this.jumpWithCondidtion((a: any, b: any): boolean => a >= b)
        break
      }
      case I.JLE: {
        this.jumpWithCondidtion((a: any, b: any): boolean => a <= b)
        break
      }
      default:
        throw new Error("Unknow command " + op)
      }
    }
  }

  public nextOperator(): I {
    // console.log("ip -> ", this.ip)
    return readUInt8(this.codes, this.ip, ++this.ip)
  }

  public nextOperant(): IOperant {
    const codes = this.codes
    const valueType = readUInt8(codes, this.ip, ++this.ip)
    // console.log(valueType)
    let value: any
    switch (valueType) {
    case IOperatantType.REGISTER:
    case IOperatantType.GLOBAL:
    case IOperatantType.ARG_COUNT:
    case IOperatantType.FUNCTION_INDEX:
    case IOperatantType.STRING:
      let j = this.ip + 2
      value = readInt16(codes, this.ip, j)
      this.ip = j
      break
    case IOperatantType.ADDRESS:
      j = this.ip + 4
      value = readUInt32(codes, this.ip, j)
      this.ip = j
      break
    case IOperatantType.NUMBER:
      j = this.ip + 8
      value = readFloat64(codes, this.ip, j)
      this.ip = j
      break
    case IOperatantType.RETURN_VALUE:
      value = 0
      break
    default:
      throw new Error("Unknown operant " + valueType)
    }
    return {
      type: valueType,
      value: this.parseValue(valueType, value),
      raw: value,
      index: valueType === IOperatantType.REGISTER ? (this.fp + value) : value,
    }
  }

  public parseValue(valueType: IOperatantType, value: any): any {
    switch (valueType) {
    case IOperatantType.REGISTER:
      return this.stack[this.fp + value]
    case IOperatantType.ARG_COUNT:
    case IOperatantType.NUMBER:
    case IOperatantType.ADDRESS:
      return value
    case IOperatantType.GLOBAL:
      return this.stack[value]
    case IOperatantType.STRING:
      return this.stringsTable[value]
    case IOperatantType.FUNCTION_INDEX:
      return this.functionsTable[value]
    case IOperatantType.RETURN_VALUE:
      return this.stack[0]
    default:
      throw new Error("Unknown operant " + valueType)
    }
  }


  public jumpWithCondidtion(cond: (a: any, b: any) => boolean): void {
    const op1 = this.nextOperant()
    const op2 = this.nextOperant()
    const address = this.nextOperant()
    // console.log("JUMP --->l", address)
    if (cond(op1.value, op2.value)) {
      this.ip = address.value
    }
  }
}

interface IFuncInfo {
  ip: number,
  numArgs: number,
  localSize: number,
}

/**
 * Header:
 *
 * mainFunctionIndex: 1
 * funcionTableBasicIndex: 1
 * stringTableBasicIndex: 1
 * globalsSize: 2
 */
const BYTE = 8
export const createVMFromFile = (fileName: string): VirtualMachine => {
  const buffer = new Uint8Array(fs.readFileSync(fileName)).buffer
  const mainFunctionIndex = readUInt32(buffer, 0, 4)
  const funcionTableBasicIndex = readUInt32(buffer, 4, 8)
  const stringTableBasicIndex = readUInt32(buffer, 8, 12)
  const globalsSize = readUInt32(buffer, 12, 16)
  console.log(
    'main function index', mainFunctionIndex,
    'function table basic index', funcionTableBasicIndex,
    'string table basic index', stringTableBasicIndex,
    'globals szie ', globalsSize,
  )

  const stringsTable: string[] = parseStringsArray(buffer.slice(stringTableBasicIndex))
  const codesBuf = buffer.slice(4 * 4, funcionTableBasicIndex)
  const funcsBuf = buffer.slice(funcionTableBasicIndex, stringTableBasicIndex)
  const funcsTable: IFuncInfo[] = parseFunctionTable(funcsBuf)
  console.log('string table', stringsTable)
  console.log('function table', funcsTable)
  console.log(mainFunctionIndex, funcsTable, 'function basic index', funcionTableBasicIndex)
  console.log('codes length -->', codesBuf.byteLength, stringTableBasicIndex)
  console.log('main start index', funcsTable[mainFunctionIndex].ip, stringTableBasicIndex)

  return new VirtualMachine(codesBuf, funcsTable, stringsTable, mainFunctionIndex, globalsSize)
}

const parseFunctionTable = (buffer: ArrayBuffer): IFuncInfo[] => {
  const funcs: IFuncInfo[] = []
  let i = 0
  while (i < buffer.byteLength) {
    const ipEnd = i + 4
    const ip = readUInt32(buffer, i, ipEnd)
    const numArgsAndLocal = new Uint16Array(buffer.slice(ipEnd, ipEnd + 2 * 2))
    funcs.push({ ip, numArgs: numArgsAndLocal[0], localSize: numArgsAndLocal[1] })
    i += 8
  }
  return funcs
}

const parseStringsArray = (buffer: ArrayBuffer): string[] => {
  const strings: string[] = []
  let i = 0
  while(i < buffer.byteLength) {
    const lentOffset = i + 4
    const len = readUInt32(buffer, i, lentOffset)
    const start = lentOffset
    const end = lentOffset + len * 2
    const str = readString(buffer, start, end)
    strings.push(str)
    i = end
  }
  return strings
}

const readFloat64 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Float64Array(buffer.slice(from, to)))[0]
}

const readUInt8 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Uint8Array(buffer.slice(from, to)))[0]
}

const readInt8 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Int8Array(buffer.slice(from, to)))[0]
}

const readInt16 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Int16Array(buffer.slice(from, to)))[0]
}

const readUInt16 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Uint16Array(buffer.slice(from, to)))[0]
}

const readUInt32 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Uint32Array(buffer.slice(from, to)))[0]
}

const readString = (buffer: ArrayBuffer, from: number, to: number): string => {
  return arrayBufferToString(buffer.slice(from, to))
}


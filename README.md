<p align="center">
  <img height="120" src="https://github.com/livoras/nestscript/blob/master/docs/logo.png?raw=true">
  <br/>

  <a href="https://github.com/livoras/nestscript/actions">
    <img src='https://github.com/livoras/nestscript/workflows/Node.js%20CI/badge.svg'>
  </a>

  <a href="https://codecov.io/github/livoras/nestscript?branch=master">
    <img src="https://codecov.io/github/livoras/nestscript/coverage.svg?branch=master">
  </a>

  <a href="https://david-dm.org/livoras/nestscript">
    <img src="https://david-dm.org/livoras/nestscript.svg">
  </a>

  <!-- <a src="https://badge.fury.io/js/nestscript">
    <img src="https://badge.fury.io/js/nestscript.svg">
  </a> -->

<!-- [![Dependency Status](https://david-dm.org/livoras/nestscript.svg)](https://david-dm.org/livoras/nestscript)
[![npm version](https://badge.fury.io/js/nestscript.svg)](https://badge.fury.io/js/nestscript)  -->

</p>


# 1. nestscript

A script nested in JavaScript, dynamically runs code in environment without `eval` and `new Function`.

`nestscript` 可以让你在没有 `eval` 和 `new Function` 的 JavaScript 环境中运行二进制指令文件。

原理上就是把 JavaScript 先编译成 `nestscript` 的 IR 指令，然后把指令编译成二进制的文件。只要在环境中引入使用 JavaScript 编写的 `nestscript` 的虚拟机，都可以执行 `nestscript` 的二进制文件。你可以把它用在 Web 前端、微信小程序等场景。

它包含三部分：

1. **代码生成器**：将 JavaScript 编译成 `nestscript` 中间指令。
2. **汇编器**：将中间指令编译成可运行在 `nestscript` 虚拟机的二进制文件。
3. **虚拟机**：执行汇编器生成的二进制文件。

理论上你可以将任意语言编译成 `nestscript` 指令集，但是目前 `nestscript` 只包含了一个代码生成器，目前支持将 JavaScript 编译成 `nestscript` 指令。

## 1.1. nestscript 指令集

```
MOV, ADD, SUB, MUL, DIV, MOD,
EXP, NEG, INC, DEC,

LT, GT, EQ, LE, GE, NE,
LG_AND, LG_OR, XOR, NOT, SHL, SHR,

JMP, JE, JNE, JG, JL, JIF, JF,
JGE, JLE, PUSH, POP, CALL, PRINT,
RET, PAUSE, EXIT,

CALL_CTX, CALL_VAR, CALL_REG, MOV_CTX, MOV_PROP,
SET_CTX,
NEW_OBJ, NEW_ARR, SET_KEY,
FUNC, ALLOC,
```

详情请见 [nestscript 指令集手册](https://github.com/livoras/nestscript/blob/master/docs/ir.md)。

例如使用指令编写的，斐波那契数列：

```javascript
func fib(a) {
  PUSH "斐波那契数列";
  CALL_CTX "console" "time" 1;
  VAR r0;
  VAR r1;
  VAR r2;
  VAR tmp;
  MOV r1 1;
  MOV r2 1;
  MOV r0 0;
  JL a 3 l2;
  SUB a 2;
  JMP l1;

LABEL l0:
  MOV tmp r2;
  ADD r2 r1;
  MOV r1 tmp;
  ADD r0 1;

LABEL l1:
  PRINT r2;
  JL r0 a l0;
  MOV $RET r2;
  JMP l3;

LABEL l2:
  PRINT "DIRECT";
  MOV $RET 1;

LABEL l3:
  MOV tmp $RET;
  PUSH "斐波那契数列";
  CALL_CTX "console" "timeEnd" 1;
  MOV $RET tmp;
}

func main() {
  PUSH "THE RESULT IS";
  CALL_CTX "console" "log" 1;
  PUSH 5;
  CALL fib 1;
  PRINT $RET;
}
```

## 1.2. TODO
- [ ] `export`，`import` 模块支持
- [ ] `class` 支持
- [ ] 中间代码优化
  - [x] 基本中间代码优化
  - [ ] 属性访问优化
- [ ] 文档：
  - [ ] IR 指令手册
  - [ ] 安装文档
  - [ ] 使用手册
  - [ ] 使用 demo
- [x] `null`, `undefined` keyword
- [x] 正则表达式
- [x] label 语法
- [ ] `try catch`
  - [x] try catch block
  - [ ] error 对象获取
- [x] ForInStatement
- [x] 支持 function.length

* * *

## 1.3. Change Log
## 1.4. 2020-09-18
* 解决 try catch 调用栈退出到 catch 的函数的地方

## 1.5. 2020-09-08
* 重新设计闭包、普通变量的实现方式，使用 scope chain、block chain
* 实现块级作用域
* 使用块级作用域实现 `error` 参数在 `catch` 的使用

## 1.6. 2020-08-25
* 闭包的形式应该是:
  * FUNC 每次都返回一个新的函数，并且记录上一层的 closure table
  * 调用的时候根据旧的 closure table 构建新的 closure table 

## 1.7. 2020-08-21
* fix 闭包生成的顺序问题
* 编译第三方库 moment.js, moment.min.js, lodash.js, lodash.min.js 成功并把编译加入测试

## 1.8. 2020-08-20
* 编译 moment.js 成功
* fix if else 语句的顺序问题

## 1.9. 2020-08-19
* ForInStatement

## 1.10. 2020-08-14
* 编译 lodash 成功

## 1.11. 2020-08-14
* `arguments` 参数支持

## 1.12. 2020-08-12
* fix 闭包问题
* 继续编译 lodash：发现没有 try catch 的实现

## 1.13. 2020-08-11
* 继续编译 lodash，发现了运行时闭包声明顺序导致无法获取闭包的 bug

## 1.14. 2020-08-10
* 编译 lodash 成功(运行失败)
* 给函数参数增加闭包声明
* UpdateExpression 的前后缀表达存储

## 1.15. 2020-08-06
* 完成 label 语法：循环、block label

## 1.16. 2020-08-05
* `null`, `undefined`
* 正则表达式字面量

## 1.17. 2020-08-03
* `while`, `do while`, `continue` codegen
* 更多测试

## 1.18. 2020-07-31
* 第一版 optimizer 完成

## 1.19. 2020-07-30
* 设计代码优化器的流程图

## 1.20. 2020-07-29
* 把操作数的字节数存放在类型的字节末端，让操作数的字节数量可以动态获取
* 对于 Number 类型使用 Float64 来存储，对于其他类型的操作数用 Int32 存储
* 可以较好地压缩二进制程序的大小.

## 1.21. 2020-07-27
* 重新设计操作数的生成规则

## 1.22. 2020-07-23
* 函数的调用有几种情况
  * vm 调用自身函数
  * vm 调用外部函数
  * 外部调用 vm 的函数
* 所以：
  * vm 在调用函数的时候需要区分是那个环境的函数（函数包装 + instanceof）
    * 如果是自身的函数，不需要对参数进行操作
    * 如果是外部函数，需要把已经入栈的函数出栈再传给外部函数
  * 内部函数在被调用的时候，需要区分是那个环境调用的（NumArgs 包装 + instanceof）
    * 如果来自己的调用，不需要进行特别的操作
    * 如果是来自外部的调用，需要把参数入栈，并且要嵌入内部循环等待虚拟机函数结束以后再返回
* 让函数可以正确绑定 this，不管是 vm 内部还是外部的

## 1.23. 2020-07-22
* 代码生成中表达式结果的处理原则：所有没有向下一层传递 s.r0 的都要处理 s.r0
* 三目运算符 A ? B : C 的 codegen（复用 IfStatement）

## 1.24. 2020-07-21
* 自动包装 @@main 函数，这样就不需要主动提供 main 函数，更接近 JS

## 1.25. 2020-07-20
* 更多测试
* 完成 +=, -=, *=, /= 操作符

## 1.26. 2020-07-17
* 新增测试 & CI
* uinary expression 的实现：+, -, ~, !, void, delete

## 1.27. 2020-07-16
* 逻辑表达式 "&&" 和 "||" 的 codegen 和虚拟机实现
* 完成闭包在虚拟机中的实现

## 1.28. 2020-07-15
* 完成闭包变量的标记方式：内层函数“污染”外层的方式
* 重构代码生成的方式，使用函数数组延迟代码生成，这样可以在标记完闭包变量以后再进行 codegen
* 设计闭包变量和普通变量的标记方式“@xxx”表示闭包变量，“%xxx”表示普通自动生成的寄存器
* 下一步设计闭包变量在汇编器和虚拟机中的生成和调取机制

## 1.29. 2020-07-13
* 设计闭包的实现
* 实现 `CALL_REG R0 3` 指令，可以把函数缓存到变量中随后进行调用

## 1.30. 2020-07-10
* 支持回调函数的 codegen
* 完成基本的 JS -> 汇编的转化和运行
* 循环 codegen
* 三种值的更新和获取
  * Identifier
    * context
    * variables
  * Memeber

## 1.31. 2020-07-09
* 完成二进制表达式的 codegen
* 完成简单的赋值语句
* 完成对象属性访问的 codegen
* if 语句的 codegen

## 1.32. 2020-07-03
* 确定使用动态分配 & 释放寄存器方案
* 表达式计算值存储到寄存器方案，寄存器名称外层生成、传入、释放

## 1.33. 2020-06-22
* 开始使用 acorn 解析 ast，准备把 ast 编译成 IR 指令

## 1.34. 2020-06-19
* `FUNC R0 sayHi`: 构建 JS 函数封装 `sayHi` 函数并存放到 R0 寄存器，可以用作 JS 的回调参数，见 `example/callback.nes`
* `CALL_VAR R0 "forEach" 1`: 调用寄存器里面存值的某个方法
* `MOV_PROP R0 R1 "length"`: 将 R1 寄存器的值的 "length" 的值放到 R0 寄存器中

## 1.35. 2020-06-18
* 完成
  * `NEW_ARR R0`: 字面量数组
  * `NEW_OBJ R0`: 字面量对象
  * `SET_KEY R0 "0" "hello"`: 设置某个寄存器里面的 key value 值
  * `CALL_CTX "console" "log" 1`: 调用 ctx 里面的某个函数方法
  * `MOV_CTX R0 "console.log"`: 把 ctx 某个值移动到寄存器

### 1.35.1. 2020-06-17
* 完成基本的汇编器和虚拟机
* 完成命令行工具 nsc，可以 `nsc compile src dest` 将文本代码 -> 二进制文件，并且用 `nsc run file` 执行
* 斐波那契数列计算例子
* 编译打包成第三方包

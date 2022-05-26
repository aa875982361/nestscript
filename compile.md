# 编译器说明

## 详细说明编译器的原理
之前的文档没有详细讲清楚编译的原理是怎样的，这篇文档用来说明是怎样将js编译为汇编语言的。

## 示例

### 变量的赋值

```javascript
var name = "plinghuang"
```

汇编：
```
func @@main() {
    VAR name;
    MOV name "plinghuang";
}
```
解释：
1. 先声明变量name，然后将 字符串"plinghuang" 赋值给变量name

### 函数调用

```javascript
console.log("plinghuang")
```

汇编：
```
func @@main() {
    REG %r0;
    REG %r1;
    MOV %r0 "plinghuang";
    PUSH %r0;
    MOV_CTX %r0 "console";
    MOV %r1 "log";
    CALL_VAR %r0 %r1 1 false;
    MOV $RET $RET;
}
```
解释：
1. 先设置两个寄存器
2. 将字符串“plinghuang” 赋值给寄存器 %r0
3. 将寄存器 %r0的值 压入栈
4. 将 console 实例 赋值给寄存器 %r0
5. 将字符串“log” 赋值给寄存器 %r1 
6. 调用函数 使用%r0 作为主体， %r1 作为执行方法名， 从栈中取出1个数据，作为执行参数 是不是new 执行方法

### for 循环

```javascript
var list = [1,2,3]
var res
for(var i=0; i<list.length; i++){
  res = list[i]
}
```

汇编：
```
func @@main() {
    VAR list;
    VAR res;
    VAR i;
    REG %r0;
    REG %r1;
    REG %r2;
    REG %r3;
    NEW_ARR list;
    MOV %r0 1;
    SET_KEY list 0 %r0;
    MOV %r0 2;
    SET_KEY list 1 %r0;
    MOV %r0 3;
    SET_KEY list 2 %r0;
    MOV i 0;
LABEL _l0_:
    MOV %r0 i;
    MOV %r2 list;
    MOV %r3 "length";
    MOV_PROP %r1 %r2 %r3;
    LT %r0 %r1;
    JF %r0 _l1_;
LABEL _l3_:
    MOV %r2 list;
    MOV %r3 i;
    MOV_PROP %r1 %r2 %r3;
    MOV res %r1;
LABEL _l2_:
    MOV %r1 i;
    ADD %r1 1;
    MOV i %r1;
    JMP _l0_;
LABEL _l1_:
}
```
解释：
1. 先声明变量：list, res, i
2. 设置4个寄存器，分别是： %r0, %r1, %r2, %r3
3. 新建一个数组： list
4. 将 数字1 移到寄存器 %r0
5. 设置数组 key 为0 的值 为寄存器 %r0的值
6. 将 数字2 移到寄存器 %r0
7. 设置数组 key 为1 的值 为寄存器 %r0的值
8. 将 数字3 移到寄存器 %r0
9. 设置数组 key 为2 的值 为寄存器 %r0的值
10. 将 数字0 赋值给 i
11. 设置label _l0_ 内部操作为
12. 将 i 的值赋值给寄存器 %r0
13. 将 list 的值赋值为寄存器 %r2
14. 将字符串“length” 赋值给寄存器 %r3
15. 获取 寄存器%r2 对应属性 %3 的值 赋值到%1
16. 比较寄存器 %0 < %1 并将结果赋值给寄存器%0
17. 判断寄存器 %0 的结果，如果为false 就跳转到label _l1_
18. 如果为true 则继续执行下一个label
19. 声明 label _l3_ 
20. 移动 list 到寄存器 %2
21. 移动 i 到寄存器 %3
22. 获取寄存器 %2 对应key为寄存器 %3 的属性值 并赋值给寄存器 %1
23. 移动 寄存器%1 的值给 res
24. 声明 label _l2_
25. 将 i 的值 移动到寄存器 %1
26. 针对寄存器 %1 做+1 的运算 并赋值给寄存器 %1
27. 将寄存器 %1 的值 赋值给 i
28. 跳到label _l0_
29. 声明 label _l1_ 
30. 不做处理 相当于跳出循环，执行另外的逻辑


### if 判断

```javascript
var num = 0
if(num === 0){
  num = 10
}else if (num === 1){
  num = 20
}else{
  num = 30
}
num = 40
```

汇编：
```
func @@main() {
    VAR num;
    REG %r0;
    REG %r1;
    REG %r2;
    MOV num 0;
    MOV %r0 num;
    MOV %r1 0;
    EQ %r0 %r1;
    JF %r0 _l1_;
    MOV %r1 10;
    MOV num %r1;
    JMP _l0_;
LABEL _l1_:
    MOV %r1 num;
    MOV %r2 1;
    EQ %r1 %r2;
    JF %r1 _l2_;
    MOV %r2 20;
    MOV num %r2;
    JMP _l0_;
LABEL _l2_:
    MOV %r2 30;
    MOV num %r2;
LABEL _l0_:
    MOV %r0 40;
    MOV num %r0;
}
```
解释：
1. 声明变量num
2. 声明寄存器 %0， %1， %2
3. 将 0 移动到变量 num
4. 将 num 的值赋给 寄存器%0
5. 将 0 赋值给寄存器 %1
6. 判断 寄存器%0 和寄存器%1 是否相等，并将值赋值给寄存器 %0
7. 判断 寄存器%0 的值 如果为 false， 跳转到label _l1_
8. 如果为ture  则继续运行
9. 给寄存器 %1 赋值为 10
10. 将寄存器 %1 的值 赋值给变量 num
11. 跳转到 label _l0_
12. 声明 LABEL _l1_ 
13. 将变量 num 的值 赋值给寄存器 %1
14. 将 1 赋值给寄存器 %2
15. 判断寄存器 %1 和寄存器 %2 的值是否一致，并将结果赋值给 %1
16. 判断寄存器%1 的值，如果为false 则跳转到label _l2_
17. 如果为 true 继续运行
18. 给寄存器 %2 赋值为 20
19. 将寄存器 %2 的值 赋值给变量 num 
20. 跳转到label _l0_
21. 声明 label _l2_
22. 给寄存器 %2 赋值为 30
23. 将寄存器 %2 的值 赋值给变量 num 
24. 声明 label _l0_
25. 这里其实就是 除了if 的其他逻辑，就是跳出if 处理之后的操作
26. 给寄存器 %0 赋值为 40
27. 将寄存器 %0 的值 赋值给变量 num 

### try catch

```javascript
try {
  JSON.parse("{}")
} catch (error) {
  throw error
}
```

汇编：
```
func @@main() {
    REG %r0;
    REG %r1;
    TRY _l0_ _l1_;
    MOV %r0 "{}";
    PUSH %r0;
    MOV_CTX %r0 "JSON";
    MOV %r1 "parse";
    CALL_VAR %r0 %r1 1 false;
    MOV $RET $RET;
    TRY_END;
LABEL _l0_:
    BLOCK 1;
    VAR error;
    GET_ERR error;
    MOV %r0 error;
    THROW %r0;
    END_BLOCK 1;
LABEL _l1_:
}
```
解释：
1. 先声明变量name，然后将 字符串"plinghuang" 赋值给变量name

### new 对象

```javascript
const obj = new Object()

```

汇编：
```
func @@main() {
    VAR obj;
    CALL_CTX 'Object' 0 true;
    MOV obj $RET;
}
```
解释：
1. 先声明变量obj
2. 调用全局的方法 Object 传入0个参数 是new 对象类型
3. 将返回值 $RET 赋值给obj

### 闭包函数

```javascript
function func(){
  var b = 2
  return function func2(a){
      console.log("func2", a, b)
      return 4
  }
}
var newFunc = func()
newFunc(3)

```

汇编：
```
func @@main() {
    VAR func;
    VAR newFunc;
    REG %r0;
    FUNC $RET @@f0;
    FUNC func @@f0;
    CALL_REG func 0 false;
    MOV newFunc $RET;
    MOV %r0 3;
    PUSH %r0;
    CALL_REG newFunc 1 false;
}
func @@f0() {
    CLS @b;
    REG %r0;
    MOV @b 2;
    FUNC %r0 @@f1;
    MOV $RET %r0;
    RET;
}
func @@f1(.a) {
    VAR func2;
    REG %r0;
    REG %r1;
    FUNC func2 @@f1;
    MOV %r0 "func2";
    PUSH %r0;
    MOV %r0 .a;
    PUSH %r0;
    MOV %r0 @b;
    PUSH %r0;
    MOV_CTX %r0 "console";
    MOV %r1 "log";
    CALL_VAR %r0 %r1 3 false;
    MOV %r0 4;
    MOV $RET %r0;
    RET;
}
```
解释：
1. 先声明变量 func, newFunc
2. 将function @@f0 赋值给 变量func
3. 调用 func 方法，传入0个参数， 不是new 执行
4. 将返回值 $RET 赋值给 newFunc
5. 将 3 赋值给 寄存器 %0
6. 将寄存器 %0 的值 放入栈
7. 调用 newFunc 传入1个参数 不是new 执行
8. 声明 @@f0 的逻辑
9. 声明闭包变量 @b 
10. 声明寄存器 %0
11. 给闭包变量 @b 赋值 2
12. 将函数 @@f1 赋值给寄存器 %0
13. 将寄存器 %0 的结果 赋值给返回值 $REST
14. 返回
15. 声明 @@f1 的逻辑
16. 接收一个参数 .a
17. 声明变量名 func2
18. 声明寄存器 %0 %1
19. 函数赋值 将 @@f1 赋值给变量 func2
20. 将字符串 “func2” 赋值给寄存器 %0
21. 将 寄存器 %0 的值 压入栈
22. 将参数.a 的值 赋值给寄存器 %0
23. 将 寄存器 %0 的值 压入栈
24. 将闭包变量 @b 的值 赋值给寄存器 %0
25. 将 寄存器 %0 的值 压入栈
26. 调用全局对象的 console 属性的值 放入 寄存器%0 
27. 将字符串“log” 赋值给寄存器 %1
28. 调用变量的函数 寄存器%0 作为对象 %1 作为方法名 从栈中取3个参数， 不是new 构建对象
29. 将4 赋值给寄存器 %0
30. 将寄存器%0 的值 赋值给 返回值 $RET
31. 返回
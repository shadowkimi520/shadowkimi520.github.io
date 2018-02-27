---
title: ES2015-syntax
date: 2017-06-12 16:12:29
tags:
---
#### let、const及块级作用域

#### Arrow Function
* Arrow Function不仅仅是一个简单的语法糖，如果CoffeeScript中一般，其内部没有this参数，对this的访问绑定到词法作用域中的this；
* Array Function的this绑定是强制性的，无法通过apply或call方法改变；
* 单行Array Function只能包含一条语句，且该语句必须是表达式语句；因为单条语句等同于return 该表达式的值，如果是错误抛出语句等非表达式语句，则无法使用return返回，此时需要使用大括号包裹；
* 若Array Function直接返回一个对象字面量，必须使用大括号包括，否则解析引擎将其解析为一个多行箭头函数，且没有使用return语句，因此返回值均为undefined;
```js
const ids = [1, 2, 3];
const users = ids.map(id => { id : id });
// [undefined, undefined, undefined]
```
#### Template String(模板字符串)
* 模板字符串与模板引擎不是同一个概念；
* 模板字符串是将以往的格式化字符串以一种语法来实现；

#### Enhanced Object Literals(对象字面量扩展语法)
#### Destructuring(解构赋值)
#### new Data-Structure
* Set、WeakSet、Map、WeakMap
* WeakSet和WeakMap主要用于内存安全，且没有size属性
* Set、Map的原型对象上存在只读存取器属性size，这一点与Array不同；Array的size属性存在于实例对象上；

### Promises and Async Function(ES7/ES2016)
* 基于回调函数的异步处理：统一参数使用规则，第一个参数为Error对象，第二个参数为返回值，但这仅仅是编码规约而已（惯例），即使采用不同的写法也不会出错；
* Promise把类似的异步处理对象和异步处理规则规范化，并按照统一的接口编写，使用规定方法之外的写法都会出错；
* Promise(诺言)是一个对象，用于传递异步操作的消息；它代表某个未来才会知道结果的异步操作及其结果值(未来值)，该异步操作最终会完成或者失败，从而对诺言对象进行决议；且承诺Promise对象的状态不受外界影响。
A promise in short:
&emsp;Image you are a kid. Your mom promises you that she'll get you a new phone a few days later. You don't know if you will get that phone[the promise result] until that day come. Someday in the future, Your mom can either really buy you a brand new phone, or stand you up and withhold the phone because she is not happy. You can only wait for that day to come[wait for the promise to resolve].
&emsp;You can in advance arrange something to do after the promise get result[Add some listener on the promise result use **then** or **catch**]; this operation in turn will result in a new promise which rely on the operation you added.
&emsp;You can listen to the promise which is resolved, that is do something according to a prior promise.

* A promise is **an object** that may produce **a single value** some time **in the future**:either a resolved value, or a reason that it's not resolved
* A promise is an object which can be returned **synchronously** from an **asynchronous** function. Then the returned promise represents the result of the asynchronous operation.
* 3 possible states: Fulfilled/Rejected/Pending (the first two is **settled**)
* Once settled, a promise can not be resettled. The immutability of a settled promise is an important feature.

The javascript standard ECMAScript promises conform the Promises/A+ specification， which must follow a specific set of rules:
1). A promise or "thenable" is an object that supplies a standard-compliant .then() method;
2). A pending promise may transition into a fulfilled or rejected state;
3). A fulfilled or rejected promise is settled, and must not transition into any other state;
4). Once a promise is settled, it must hava a value(which may be undefined). That value must not change;
{% asset_img then.png promise/A+规范then %}

在异步处理的时候并不是说Promise永远都是最好的选择，要根据自己的目的和实际情况选择合适的实现方式；比如Stream模式等等。

The core idea behind promises is that a promise represents the result of an asynchronous operation.

### ES6 Fetch API

---
title: JS原型继承机制
date: 2017-05-14 13:16:41
tags: JS prototype
---


JS作为一门弱类型的动态语言，其本身具有很大的灵活性，因此跨过 JavaScript 中的各种坑就显得不是那么容易，准备写一系列博客来记录下JS学习过程中自己的感悟，在整理的同时加深理解。

### 原型继承与类继承
* 原型继承一般具有动态性，而类继承是静态的
* 原型继承通过委托的方式实现面向对象编程，在JS中内部通过`__proto__`实现
* `__proto__`是一个存取器属性，作为Object.prototype的自有属性存在
* proto属性的前后两个下划线表示该属性是非标准的
* 访问__proto__属性时，该存取器属性会获取对象内部的[[prototype]]属性进行显示，如同Object.prototype.toString.call(obj)获取对象内部的[[class]]属性一样
```js
console.log(Object.getOwnPropertyDescriptor(Object.prototype, "__proto__"));
    { get: [Function: get __proto__],
      set: [Function: set __proto__],
      enumerable: false,
      configurable: true }

obj.hasOwnProperty('__proto__');    ==> false

var obj = Object.create(null);
obj.__proto__;  ==> undefined
    1. 因为obj的内部[[prototype]]属性直接指向null,因此无法通过原型委托访问到Object.prototype上定义的'__proto__';
    2. Object.prototype.__proto__通过调用getter方法返回内部的[[prototype]]为null
```
<br/>
### `__proto__` && prototype
+ 自定义函数对象都拥有不可删除的prototype属性，但prototype属性值是可以修改的
+ 内置构造函数也拥有不可删除的prototype属性，但其prototype属性是不可配置，且不可修改的
```js
functon foo() {};
Object.getOwnPropertyDescriptor(foo, "prototype");
// {value: foo {}, writable: true, enumerable: false, configurable: false}
```

{% img /images/proto.jpg 628 600 __proto__ && prototype %}
---
title: 'JavaScript: Array方法'
date: 2017-05-15 14:33:02
tags: JS Array
---
在数组中加入字符串键值/属性并不是一个好主意；建议使用对象来存放键值/属性值，用数组来存放数字索引值；因为内置的数组方法不会去处理数组中的键值/属性值
## ES3
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;除toString/concat之外的任意ES3方法都是通用的，可以作用于任何对象，通过length属性进行操作，修改原对象的方法不能通过不可修改对象调用，比如字符串原始值或者其包装对象，toString会通过this instanceof Array判断是否为数组对象及其子类型对象，从而串接其索引属性；concat方法通过Array.isArray(this)来判断是否为数组，即使是数组的子类型也是作为一个整体原样插入，不进行扩展，其对后续的参数也是通过Array.isArray判断是否是数组，如果是数组则进行扩展插入，否则原样整体插入.
`join` `reverse`  `concat(类数组对象作为this时，整体插入新数组)` `sort` `slice` `splice` `push/pop` `unshift/shift` `toString(不能作用于类数组对象,在类数组或者原始类型上调用时等同于调用Object.prototype.toString.call(param))/toLocaleString`
* 这些方法的内置实现中，只有在需要插入元素到原对象的时候，才会往原对象中插入length属性，否则仅仅是调用length属性，不会添加length属性；这与不修改原对象的承诺保持一致。

## ES5
ES5中定义的所有数组方法都是通用的，可以作用于类数组对象，以及字符串原始值，甚至数字原始值等，只需根据其length属性进行操作即可
`forEach` `map` `filter` `every/some` `reduct/reduceRight` `indexOf/lastIndeOf` `Array.isArray`
* 所有的ES5数组方法均不会在方法中修改原对象，但传入的函数参数中可以修改原对象，但不建议这么做，除非不得已；
* 所有的ES5数组方法均会跳过稀疏元素的处理，不会对稀疏元素适用传入的函数，但有些方法会过滤稀疏元素，返回一个没有稀疏位的数组

## ES6
`from` `fillIn`
### join
* 将数组中所有*可索引* 元素__转化为字符串__并串接在一起，返回最后生成的字符串，并可以指定可选的字符串作为分割符，默认使用逗号；
* 稀疏元素不加入结果中，但稀疏元素间的分隔符依旧存在；
* undefined和null元素不会被转型为字符串，继而添加到结果字符串中；
* 数组元素使用String(elem)来执行到字符串原始值的转换；
* 该方法可以作用于类数组对象及字符串原始值;
* sep不传入，或者传入undefined，均使用默认的逗号进行串接；其他通过String(sep)执行转换
```js
Array.prototype.join.call('abc'); // "a,b,c"
Array.prototype.join.call(null); // TypeError，说明join函数执行于严格模式
Array.prototype.join.call(5); // '', 因为原样传入之后，访问length属性为undefined
Array.prototype.join.call({a:1, b:2}) //'', 没有length属性，不是类数组对象
Array.prototype.join.call({a:1, b:2, length:3}) // ',,',存在length属性，但是稀疏的
Array.prototype.join.call({0:1, 1:2, length:3}) // '1,2,'

[1,2,3].join(undefined); // '1,2,3'
[1,2,3].join(); // '1,2,3'
[1,2,3].join(null) // '1null2null3null'
Array.prototype.join = Array.prototype.join || function(sep) {
    'use strict';   // 必须加这一句，否则不能模拟内置实现传入null/undefined会抛出异常的情况
    if (this == null) throw new TypeError("Array.prototype.join called on null or undefined"); // 字符串中不要包含"TypeError:"
    var that = Object(this); // 对原始类型执行到对应包装对象的转型
    sep = typeof sep === undefined ? ',' : String(sep);  // 不用捕捉到String转型的异常，因为内置实现转型失败就是会抛出异常的
    var result = '';
    for (var i = 0, len = that.length; i < len; i++) { // 0 < undefined (false)   0 > undefined (false)
        if (that.hasOwnProperty(i)) {  // 该判断可以省略，因为i不在that中的话，that[i]为undefined，下一步还是能过滤掉
        // 应该要去掉该层判断，这样才能访问到原型对象中的索引属性，内置版本是能访问到原型对象的索引属性的
        // var arr = [1,2,3];
        // var my_arr = Object.create(arr);
        // my_arr.join(); // '1,2,3'
            result += that[i] == null ? "" : String(that[i]);
        }
        result += i === len ? "" : sep;
    }
}
```

### reverse
* 工作于严格模式，通过call/apply传入的参数会原样传给reverse方法，传入null/undefined会抛出异常
* 直接修改传入的对象，并返回修改后的对象；因此无法传入字符串或者其包装对象，这些对象不可修改
* 可以作用于 **可修改的** 类数组对象，根据其length属性将其数字索引元素进行反转；稀疏元素原样保留，并逆序
* 可以作用于任何 **可修改** 或者 **无需修改(length不存在或为0)** 的对象，非字符串原始类型返回其包装对象

```js
Array.prototype.reverse.call(null); // TypeError
Array.prototype.reverse.call(undefined); // TypeError
Array.prototype.reverse.call(5); // [Number 5]
Array.prototype.reverse.call('abc'); // TypeError
Array.prototype.reverse.call(new String('abc')); // TypeError
Array.prototype.reverse.call({0:"abc", 1:"cde", 2:"efg"}) // {0:"abc", 1:"cde", 2:"efg"} 因为没有指定length属性
Array.prototype.reverse.call({0:"abc", 1:"cde", 2:"efg", length:3}) // {0:"efg", 1:"cde", 2:"abc", length:3}

Array.prototype.reverse = Array.prototype.reverse || function() {
    'use strict';
    if (this == null) throw new TypeError('Array.prototype.reverse called on null or undefined');
    var that = Object(this);
    for (var left = 0, right = that.length - 1; left < right; left++, right--) { // that.length不存在的话，undefined - 1 为NaN (0 < NaN 返回false); that.length为null的话，null - 1为 -1 (0 < -1 返回false)
        // hasOwnProperty的判断在内置版本中为 left in that，这样会根据原型对象上的索引属性来更新当前对象，不是特别合理，比如：
        // var arr = [1,2,3];
        // var my_arr = Object.create(arr);
        // my_arr.reverse;  随后my_arr为{0:3,2:1}
        if (that.hasOwnProperty(left) && that.hasOwnProperty(right)) {
            var temp = that[left];
            that[left] = that[right];
            that[right] = that[left];
        } else if (that.hasOwnProperty(left) && !that.hasOwnProperty(right)) {
            that[right] = that[left];
            delete that[left];
        } else if (!that.hasOwnProperty(left) && that.hasOwnProprety(right)) {
            that[left] = that[right];
            delete that[right];
        }
    }
    return that;
}
```

### concat
* concat 可以以类数组对象进行调用，但是不会对其进行扩展, 且最后返回结果必定是数组;
* 该方法返回一个新的数组，并且稀疏元素原样保留到新数组中;
* undefined/null元素仍旧会添加到返回的新数组中，若数组对象中不存在的稀疏元素在Array.prototype中存在对应索引的元素，则原型对象中的该索引元素也会被包含进来；因此避免对内置构造函数的原型对象进行修改，尤其是Array.prototype这种经常操作的数组对象原型；
* 该方法工作于严格模式，因此传入call或apply的第一个参数会被原样传入，不会进行修改或者转型成包装对象
```js
var obj = {0:'a', 1:'b', 2:'c', length:3};
Array.prototype.concat.apply(obj, [1,2,3]); // [{0:'a', 1:'b', 2:'c', length:3}, 1, 2, 3]
Array.prototype.concat.apply('abc', [1,2]); // [[String: 'abc'], 1, 2], 因为'abc'转换为其包装对象，该对象是类数组对象
Array.prototype.concat.apply(Array.prototype, [1,2]) // [1, 2], 因为Array.prototype的length === 0，虽然它也是数组对象
Array.prototype.concat.apply([1,2], "abc")  // TypeError: CreateListFromArrayLike called on non-object
Array.prototype.concat.apply(null, [1,3]) // TypeError: Array.prototype.concat called on null or undefined
Array.prototype.concat.apply(5, [1,3]) // [[Number: 5], 1, 3]
Array.prototype.concat.apply(5, {}) // [[Number: 5]]
Array.prototype.concat.apply([1,,,5], [,2]); // [1,,,5,undefined,2] 注意结果中的undefined，这是apply的副作用之一

Array.isArray = Array.isArray || function(o) {
    'use strict';
    return typeof o === 'object' &&   // 这部分判断可以省略
    Object.prototype.toString.call(o) === "[object Array]";
    // toString工作于严格模式，call/apply参数原样传入toString；
    // toString内部对null/undefined进行了特殊处理，确保不会调用(null/undefined).[[class]]属性，以免抛出异常
    // 对Array子类型对象的判断依赖于该子对象的对象方式，通过Object.create(arr-object)创建的对象其内部[[class]]属性为'[object Object]'；
    // 若通过自定义一个子类构造函数，并以Array类型对象作为原型的话（或Obejct.create(Array.prototype)生成的对象作为原型），自定义构造函数不会引入内部[[class]]属性，此时访问原型对象的[[class]]属性. **该方法**测试无效，因为任意自定义构造函数的new调用返回的新分配的对象的内部[[class]]属性均为'[object Object]'(new不返回新对象，返回指定对象的除外，比如返回Array对象)，可能设定该内部属性的地方是在各构造函数对象的[[construct]]属性当中，new方式调用该构造函数对象时，会先调用其[[construct]]属性生成一个新的对象，包括分配空间，设置[[prototype]]原型，设置[[class]]属性等等。
}

Array.prototype.concat = Array.prototype.concat || function() {
    'use strict'; // 实现为严格模式，防止call/apply方法修改传入的this
    if (this == null) throw new TypeError("Array.prototype.concat called on null or undefined"); // 字符串中不要包含"TypeError:"
    var that = Object(this); // 内置版本作用于原始类型时，会插入对应的包装对象
    var result = [];
    if (Array.isArray(that)) {
    // 内置实现没有采用 that instanceof Array来进行判断， 与Array.prototype.toString的实现不同
        for (var i = 0, len = that.length; i < len; i++) {
            if (that.hasOwnProperty(i)) {
            // 内置版本采用if (i in that)进行判断，以求能将原型对象上的索引属性包含进来
                result[i] = that[i];
            }
        }
    } else {
        result.push(that);
    }
    for (i = 0, len = arguments.length; i < len; i++) {
        var pos = result.length;
        if (Array.isArray(arguments[i])) {
            for (var sub_i = 0, sub_len = arguments[i].length; sub_i < sub_len; sub_i++) {
                if (arguments[i].hasOwnProperty(sub_i)) {
                    result[pos + sub_i] = arguments[i][sub_i];
                }
            }
        } else {
            result.push(arguments[i]);
        }
    }
    return result;
}
```
执行过程：1).判断调用上下文this是否为数组，如果为数组则根据其length属性拷贝元素到新生成数组中，否则将this作为独立元素插入到新生成数组；2).随后参数是数组则扩展，有length属性的类数组对象不扩展，直接插入新生成数组，若apply第一个之后参数不为对象则TypeError: CreateListFromArrayLike called on non-object

### sort
* sort 排序并返回排序后的数组，不带参数调用时，数组元素以字母表顺序排序, 如有必要将临时转化为字符串进行比较
* 若数组包含undefined元素，则它们会被排到数组的尾部，无论传入比较函数，均不对undefined元素进行任何转型
* 若数组包含null元素，则null元素排在转型为'null'后按字母表顺序应该所在的位置；
* null元素在传入比较函数的情况下，会根据比较函数进行相应的转型，比如`function(a,b) {return a - b;}`， 则null会执行到Number的转型，且Number(null)为0；其他无法执行减法操作的元素返回NaN, 这些元素的位置不变。
* 相邻位置元素两两传入参数函数进行比较，使用快速排序算法吗？
* 稀缺位置在排序后全部移到最右侧，且位于undefined元素之后
* sort函数可以作用于类数组对象，且排序逻辑与数组一致，返回排序后的类数组对象，而非数组
```js
var obj = {0:'c', 1:'b', 4:'a', length:5};
Array.prototype.sort.call(obj)  // {0:'a', 1:'b', 2:'c', length:5}, 注意稀疏元素都移到了序号大的位置上
Array.prototype.concat.call([1,2], obj) // [1, 2, {0:'a', 1:'b', 2:'c', length:5}]
Array.prototype.concat.apply([1,2], obj); // [1, 2, 'a', 'b', 'c', undefined, undefined]
// apply第二个参数传入任意对象都可以，都不一定需要有length属性, 但必须为对象，因此传入字符串原始值会抛出TypeError
Array.prototype.sort.call('cba') // TypeError:Cann't assign to read only property '1' of object '[object String]'
// 由报错信息可以看出第一步将b和c交换，第一次循环先将最大的挪到最右边的逻辑，冒泡？
```

### slice
* slice工作于严格模式，call/apply方法传入的第一个this参数会不加修改原样传入slice方法；
* 可作用于除null/undefined的任何类型值，在null或者undefined上调用TypeError；
* 作用于类数组对象或者其他原始值上均返回数组，若不存在length属性或者指定的范围超出length范围，则返回空数组；
* 稀疏元素只要在范围内，依旧存在于返回的数组中；
* 会根据访问到的length属性值来截取指定范围的元素，若当前对象不存在该索引属性，则会插入原型对象上的对应索引属性(如果存在的话)；

```js
Array.prototype.slice = Array.prototype.slice || function(from, to) {
    'use strict'; // 一定要加严格模式，否则传入null或者undefined会被修改成全局对象
    if (this == null) throw new TypeError('Array.prototype.slice called on null or undefined');
    var that = Object(this);
    var result = [];
    if (!that.length) {
        return result;
    }
    from === undefined ? from = 0 : void 0; // 如果from未传入或者传入undefined,校正为0
    to === undefined ? to = that.length : void 0; // 如果to传入undefined值或者未传入
    from = Math.round(Number(from));
    to = Math.round(Number(to));
    // that.length = that.length || 0;
    // 该操作可能会给that对象添加length属性，造成调用slice修改原对象的副作用，应避免使用
    from < 0 ? from += that.length : void 0; // 处理负索引
    to < 0 ? to += that.length : void 0; // 处理负索引
    from < 0 ? from = 0 : void 0; // 从最左侧之前开始分割，重置为从索引0开始，避免插入非索引的负值属性
    for (var i = from; i < to && i < that.length; i++) {
        if (i in that) {
            result.push(that[i]);
        } else {
            result.length++;
        }
    }
    return result;
}
```

### splice
* 在数组中插入或删除元素的通用方法，可作用于 **可修改的**对象；
* splice与slice/concat, 它会修改原对象，在修改原对象的同时返回一个由删除元素组成的数组；而非返回原对象，只是修改原对象而已；
* 如果没有删除任意元素，则返回一个空数组；
* 前两个参数指定需要删除的数组元素，紧随其后的任意个数的参数指定需要插入到数组中的元素，并从第一个参数指定的位置开始插入；
* 若指定的deleteFrom的索引大于等于数组长度，则从数组或者对象最后插入元素，不会产生稀疏数组
* 若deleteFrom小于0，代表从最右侧开始索引；但是如果负值超出了最左边的元素，则需要校正为0
* deleteFrom可以不指定，或者指定为null/undefined,此时均校正为从0开始；
* deleteLength可以不指定，如果不指定的话一直删除到length属性指定的末尾；指定为null/undefined的话，校正为0，不删除任何元素
```js
Array.prototype.splice = Array.prototype.splice || function(deleteFrom, deleteLength) {
    'use strict';
    if (this == null) throw new TypeError('Array.prototype.splice called on null or undefined');
    var that = Object(this);
    that.length = that.length || 0; // 内置实现作用于非类数组对象的时候，即使不插入任何元素，也会添加length属性，且值为0
    // 应该修正为如下代码，避免首先对'abc'对象的length属性进行一次修改，只有在length属性不存在的时候才添加length属性
    // if (that.length == null) that.length = 0; 和unshift方法是一样的
    // 内置方法对that.length属性的任何修改都是在程序执行的最后，可能发生that.length属性不可写，但是对象已经被修改的情况，此时到最后一步才会报错，实际上对that对象的修改已经完成
    if (deleteFrom == null) deleteFrom = 0; // deleteFrom不传，或者传入null/undefined，均校正为0
    if (1 in arguments) {
        deleteLength == null ? deleteLength = 0 : deleteLength = Math.round(Number(deleteLength)); // Number('12ab') 返回NaN,符合预期
    } else {
        deleteLength = that.length;
    }
    deleteFrom < 0 ? deleteFrom += that.length : void 0;
    deleteFrom < 0 ? deleteFrom = 0 : void 0; // 依旧小于0的话，校正为从头开始删除
    var arr_after = Array.prototype.slice.call(that, deleteFrom + deleteLength);

    var arr_result = Array.prototype.slice.call(that, deleteFrom, deleteFrom + deleteLength);
    var arr_insert = Array.prototype.slice.call(arguments, 2);

    for (var i = deleteFrom, len = that.length; i < len; i++) {
        if (that.hasOwnProperty(i)) {
            delete that[i]; // 类数组对象在设置that.length的时候不会自动delete元素
        }
    }
    that.length = deleteFrom > that.length ?  that.length : deleteFrom;
    //Array.prototype.push1.apply(that, arr_insert); 避免插入稀疏元素，替换为下面的循环

    for (var i = 0, len = arr_insert.length; i < len; i++) {
        if (arr_insert.hasOwnProperty(i)) {
            Array.prototype.push.call(that, arr_insert[i]);
        } else {
            that.length++;
        }
    }
    //Array.prototype.push1.apply(that, arr_after); 避免稀疏元素在apply之后转换为undefined插入，替换为下面的循环
    for (var i = 0, len = arr_after.length; i < len; i++) {
        if (arr_after.hasOwnProperty(i)) {
            Array.prototype.push.call(that, arr_after[i]);
        } else {
            that.length++;
        }
    }
    return arr_result;
}
```

### push/pop
* push方法在数组的尾部插入一个或多个元素，并返回数组新的长度
* push方法不会对传入的参数数组进行扩展，原样插入参数数组
* push方法可以作用于 **可修改** 的类数组对象，不能作用于字符串包装对象及字符串原始值（因为其length属性及已经存在的索引属性不可写），但可以作用于其他原始值类型
* 根据对象的length属性进行插入操作，若对象不存在length属性，则添加length属性，并根据插入参数个数更新length属性
* 数组的length属性是不可配置且不可枚举的，索引属性可配置可枚举可写
* 字符串包装对象的length属性不可配置，不可枚举，不可写；索引属性不可配置，可枚举，不可写

```js
Array.prototype.push = Array.prototype.push || function() {
    'use strict';
    if (this == null) throw new TypeError('Array.prototype.push called on null or undefined');
    var before, after;
    var that = Object(this);
    // 内置实现仅在length属性不存在
    that.length = that.length || 0;
    // 内置push方法作用于可修改对象时插入的length属性也是可配置、可枚举、可写的, 以后可能内部实现会修改成添加的length属性不可枚举；
    // 我们的方法中保持一致，不然可以通过Object.defineProperty(obj, desc_obj)来添加不可配置不可枚举的length属性
    for (var i = 0, len = arguments.length; i < len; i++) {
        before = that.length;
        that[that.length] = arguments[i];
        after = that.length;
        before === after ? that.length++ : void 0;
        // 数组类型及其子类型在插入元素之后，会自动更新length属性
    }
    return that.length;
}
```
* pop方法返回删除数组的最后一个元素，减小数组长度并返回删除的值
* 该方法修改原来的数组或者对象；若没有元素可以删除(length为0，或者length属性不存在)，该方法返回 undefined
* 稀疏位置的元素pop，返回结果为undefined
```js
var arr = [1,2,3];
var my_arr = Object.create(arr);
my_arr.pop(); // 3, 返回my_arr[my_arr.length - 1]
my_arr // {length:2}, length属性 - 1; 删除不存在元素静默失败
arr // [1,2,3] 原型对象的属性delete运算符无法直接删除

Array.prototype.pop = Array.prototype.pop || function() {
    'use strict';
    if (this == null) throw new TypeError("Array.prototype.pop called on null or undefined");
    var that = Object(this);
    var result;
    that.length = that.length || 0;
    if (that.length === 0) {
        return undefined;
    }
    result = that[that.length - 1];
    if (!that instanceof Array) delete that[that.length - 1];
    that.length = that.length - 1; // 数组对象设置length属性会自动删除超出元素，而且不会产生稀疏空位
    // 直接使用delete删除数组索引，会造成空位;
    // 其实对于数组对象也可以delete索引元素，然后再设置length属性，这样针对各种情况就能保持代码的一致
    return result;
}
```

### unshift/shift
* 在数组或者类数组对象或者其他可修改对象的头部插入多个或者删除一个元素
* unshift可以一次性插入多个元素，这些元素在数组中保持传参的顺序，该方法返回新的长度；
* shift删除第一个元素，并返回它；后序元素要逐位下移；

```js
Array.prototype.unshift = Array.prototype.unshift || function() {
    'use strict';
    if (this == null) throw new TypeError('Array.prototype.unshift called on null or undefined');
    var that = Object(this);
    //that.length = that.length || 0; // 这样默认会修改一次length属性，但作用于'abc'时，内置版本是最后才修改一次length
    if (that.length == null) that.length = 0; // 修改成这样就和内部方法的报错顺序一致了，但在length：null[writable:false]的情况下内置方法已经修改了原对象，然后修改length的时候才报错；因此这里的判断内置方法采用的是 'length' in that;并生成一个临时变量存储修正后的length属性；并在最后将该临时变量赋值给that.length属性
    var need_insert_len = arguments.length;
    var original_len = that.length;
    //that.length += need_insert_len; // 先调整length到最终值，防止通过that[pos + need_insert_len]给数组添加索引值时自动更新length属性，造成that.length变化；这样的话最后需要根据是否为数组来判断是否需要执行that.length += need_insert_len，会比较麻烦
    // 内置版本是在最后才修改长度的，所以这里注释掉
    for (var pos = original_len - 1, first = 0; pos >= first; pos--) {
        if (pos in that) {
            that[pos + need_insert_len] = that[pos];
        } else {
            delete that[pos + need_insert_len];  // 稀疏位置右移，原先索引上的属性需要删除
        }
    }
    for (var i = 0, len = need_insert_len; i < len; i++) {
        that[i] = arguments[i];
    }
    // 内置方法通过临时变量来记录length属性值，并在最后将该临时变量赋值给that.length
    that.length === original_len ? that.length += need_insert_len : void 0;
    return that.length;
}

```

```js
Array.prototype.shift = Array.prototype.shift || function() {
    if (this == null) throw new TypeError('Array.prototype.shift called on null or undefined');
    var that = Object(this);
    if (that.length == null) that.length = 0; // 会在原先不存在length属性的对象上添加length属性，因此不能保证不修改原对象
    // 所有的内置方法都是在最后设置that.length属性，前面用一个临时变量来保存修正后的length属性，包括下面的修正步骤在内
    that.length = Math.round(Number(that.length));
    if (that.length < 0 || Number.isNaN(that.length)) that.length = 0;
    // 内置版本会以如上方式修正原来对象的length属性, 其他数组方法也需要加上这一操作
    // 内置版本应该是将修正后的属性赋值给临时变量，最后才将临时变量赋值给that.length, 没有在前面直接修改that.length属性
    if (that.length === 0) return undefined;
    // 即使存在属性为0的元素，若length属性指定为0的话，依旧返回undefined，不返回that[0]；
    // var obj = {0:'abc', length:0};
    // Array.prototype.shift.call(obj); // undefined, obj保持原样
    var result = that[0];
    for (var i = 0, last = that.length - 1; i < last; i++) {
        if (i+1 in that) {
            that[i] = that[i + 1];
        } else {
            delete that[i];
        }
    }
    delete that[last];
    that.length--;
    return result;
}
```

### toString/toLocaleString
* 将数组每个元素转化为字符串(执行String(elem)操作)，返回用逗号串接的字符串
* 只能对数组对象发挥作用，this为其他对象或者原始类型时，调用Object.prototype.toString.call(param)
* this上下文传入null/undefined的话, 抛出TypeError: Cannot convert undefined or null to object
* 稀疏元素不插入返回的字符串，null/undefined元素也不会转型为字符串并插入，这种规定与join方法一致
* Object.prototype中的toLocaleString方法只是会简单调用this上下文对象的toString方法，不管该this指向原始类型还是对象类型；
* Array.prototype中的toLocaleString方法可以作用于类数组对象，而toString方法不会处理类数组对象，并且对原始值类型的数组直接通过String(elem)进行转型，对象类型的才会调用elem.toLocaleString方法
* String.prototype 和 Function.prototype中均不具备toLocaleString方法
```js
String.prototype.toString = function() {return "test";};
Object.prototype.toLocaleString.call("abc"); // "test", 直接调用传入参数的toString方法
// 另外，与Object.prototype.toString不同，toLocaleString会检测null/undefined, 以便调用传入参数的方法
Object.prototype.toLocaleString.call(null) // TypeError: Object.prototype.toLocaleString called on null or undefined
```

```js
Array.prototype.toString.call(null); // TypeError
Array.prototype.toString.call(5); // "[object Number]"
Array.prototype.toString.call("abc"); // "[object String]"

Array.prototype.toString = Array.prototype.toString || function() {
    'use strict'; // 确保call/apply传入null/undefined等不替换为全局对象
    if (this == null) throw new TypeError("Cannot convert undefined or null to object");
    var result = '';
    var that = Object(this);
    if (Array.isArray(that)) {
    // 内置实现采用的判断准则是 that instanceof Array || that.constructor === Array, 因此可以作用于继承Array的对象, 以及Array.prototype对象。如下代码会返回'1,2,3';
    // var arr = [1, 2, 3];
    // var my_arr = Object.create(arr);
    // Array.isArray(my_arr) 会返回 false, 但 my_arr instanceof Array 会返回 true
    // 内置： Array.prototype.toString.call(my_arr)  ==> "1,2,3"

        for (var i = 0, len = that.length; i < len; i++) {
            if (that.hasOwnProperty(i)) {
                // 内置版本不进行该判断，因此只要that[i]不为null/undefined就会包含进最后返回的字符串中；
                // 不管i属性是不是继从原型对象中继承而来
                // 这是配合上面的 that instanceof Array判断规则来指定的！
                result += that[i] == null ? "" : String(that[i]);
                // 内置版本在转型为字符串时，直接调用的ToString()抽象操作，而非String()函数
                // 可以通过 elem + '' 取代String(elem)来模拟调用ToString抽象操作
            }
            result += i === len - 1 ? "" : ",";
        }
        return result;
    } else {
        return Object.prototype.toString.call(that);
    }
}

Array.prototype.toLocaleString.call(5); // '', 因为不存在length属性
Array.prototype.toLocaleString.call("abc"); // 'a,b,c'

// 修改String类型的原有toLocaleString方法，看看是否会作用于这类元素
String.prototype.toLocaleString === Object.prototype.toLocaleString // ture
String.prototype.hasOwnProperty("toString") // true
String.prototype.hasOwnProperty("toLocaleString") // false, 原型中不具备该方法
Function.prototype.hasOwnProperty("toLocaleString") // false, 原型中不具备该方法

String.prototype.toLocaleString = function() {
    return "hello";
}
var arr = ['abc', 1, 2];
arr.toLocaleString(); // 'abc,1,2'， "abc"是原始类型，直接通过String("abc")返回"abc"
var arr_2 = [new String("abc"), 1, 2];
arr_2.toLocaleString(); // 'hello,1,2', new String("abc")不是原始类型，是对象类型，调用对象自身的toLocaleString进行转型

Array.prototype.toLocaleString = Array.prototype.toLocaleString || function() {
    'use strict';
    if (this == null) throw new TypeError("Cannot convert undefined or null to object");
    var result = '';
    var that = Object(this);
    //if (Array.isArray(that)) {
        // 内置版本Array.prototype.toLocaleString可以作用于类数组对象及字符串等任意原始值，根据length属性进行拼接
        for (var i = 0, len = that.length; i < len; i++) {
            if (that.hasOwnProperty(i)) {  // 与Array.prototype.toString一样，内置版本不包含该判断，这样就可以列举原型中的索引属性
            // 跳过稀疏元素，以及null/undefined元素
                result += that[i] == null ? "" : (typeof that[i] !== 'object' && typeof that[i]) !== 'function') ? String(that[i]) : that[i].toLocaleString();
                // 对于原始类型(即使是字符串),也不会调用对应包装对象的toLocaleString方法
            }
            result += i === len - 1 ? "" : ",";
        }
        return result;
    //} else {
    //
    //}
}
```

```js
// 通过Object.create创建的对象，其内部[[class]]属性为'[object Object]'
var my_arr = Object.create(Array.prototype);
Array.isArray(my_arr); // false,因为其内部的[[class]]属性为"[object Object]"
Object.prototype.toString.call(my_arr); // '[object Object]'
Object.prototype.toString.call(Array.prototype); // '[object Array]'


var arr = [1, 2, 3];
var my_arr = Object.create(arr);
Array.isArray(my_arr); // false
Object.prototype.toString.call(my_arr) // '[object Object]'
// 通过Object.create()方式创建的对象的内部[[class]]属性均为'[object Object]', 避免自定义子类型继承内置类型(比如Array)，但是在特性上却拥有不一致的表现
------------------------------

function My_Array() {
    Array.call(this); // 返回[]空数组，因为Array通过构造函数与不通过构造函数调用的结果一致，内部首先会检测this instanceof Array是否成立，所以会生成一个新的[]对象
    console.log(Object.prototype.toString.call(this)); // '[object Object]' 不会在非数组对象上调用Array方法，因此就没有添加Array对象的内部[[class]]属性
}
var obj = new My_Array();

var obj = Object(null); // {} 返回一个空对象，无论Object是否处于严格模式环境
```

```js
Object.prototype.toString.call(null) // '[object Null]'
Object.prototype.toLocaleString.call(null) // TypeError: Object.prototype.toLocaleString called on null or undefined
// Object.prototype中的toString对null/undefined进行了特殊处理，从而可以在用户代码中识别null/undefined类型

Object.prototype.toString.call(RegExp.prototype) // '[object Object]'
Object.prototype.toString.call(Array.prototype) // '[object Array]'
RegExp.prototype.exec('abc'); // TypeError: Method RegExp.prototype.exec called on incompatible receiver [object Object]

Array.prototype instanceof Array; // false
RegExp.prototype instanceof RegExp; // false
// instanceof 操作符检查右侧操作数的prototype属性是否在左侧操作数的__proto__属性链上
```
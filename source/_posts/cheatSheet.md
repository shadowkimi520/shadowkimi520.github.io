---
title: cheatSheet
date: 2017-06-12 11:49:51
tags:
---
常用第三方API及内置API的JS实现

#### Object.deepFreeze from MDN
```js
Object.deepFreeze = Object.deepFreeze || function(obj) {
    var propNames = Object.getOwnPropertyNames(obj);
    propNames.forEach(function (name) {
        var prop = obj[name];
        if (typeof prop === 'object' && prop !== null) {
            Object.deepFreeze(prop);
        }
    });
    return Object.freeze(obj);
}
```

### Object.create
```js
Object.create || Object.create = function (parent, properties) {
    function F() {}
    F.prototype = parent;
    var child = new F;
    for (var k in properties) {
        child[k] = properties[k].value;
    }
    return child;
}
```

### inherit
```js
var inherit = (function () {
    function F() {}
    return function (child, parent) {
        F.prototype = parent.prototype;
        child.prototype = new F;
        child.prototype.construcotr = child;
        chidl.superproto = parent.prototype;
        return child;
    };
    })();
```

#### JSONP
```js
const JSONP = (function () {
    const global = window;
    const defaultOptions = Object.freeze({
        data : {},
        callback : (data) => {}
        });
    function safaEscape(str) {
        return encodeURIComponent(str.toString())
    }

    return (root, opts = defaultOptions) => {
        let url = root.trim().replace(/\?$/, '') + "?";
        const keys = Object.keys(opts.data);
        for (const key of keys) {
            url += `${safeEscape(key)}=${safeEscape(opts.data[key])}&`
        }
        const callbackName = `json${Math.random().toString(32).substr(2)}`;

        global[callbackName] = function(data) {
            delete global[callbackName];
            opts.callback.call(JSONP, data);
        }
        url += `jsoncallback=${callbackName}`;
        const script = document.createElement('script');
        script.src = url;
        document.getElementsByTagName('body')[0].appendChild(script);
    };
})()

// 使用方式:
JSONP('http://api.flickr.com/services/feeds/***.gne', {
    data: {
        tags: 'cat',
        tagmode: 'any',
        format: 'json'
    },
    callback(data) {
        console.log(data);
    }
});
```

### parseInt
```js
var parseInt = function(str, radix) {
    // if (Number(radix) < 2 || Number(radix) > 36) return NaN;
    // 优先判断不可取，看似加速API，但是对于Number(false, '', null)等均返回0，此时radix应该置为10 或者 16
    // 改写为：
    //var temp = Number(radix);
    //if (temp !== 0 && (temp < 2 || temp > 36)) return NaN;
    //内部parseInt版本会对传入的radix参数先执行Number(radix)转型，若为NaN,则设置为0
    radix = Number(radix);
    if (radix !== radix) radix = 0;
    var result = 0;
    str = (str + '');  //注意与String(str)转型的区别
    // 最好不要用str + ''转型，因为对于Symbol原始值会直接调用ToString抽象操作,导致异常；这里为了保持和内部版本一致，所以直接使用ToString抽象操作的+''操作
    // 内部API一般不会再调用JS层面的函数，比如String(str);都是直接调用ToString抽象操作
    var reg_result = /^\s*(\+|\-)?((?:0x|0X)?\d*)/.exec(str);
    // var reg_result = /^\s*([\+\-]?)((?:0x|0X)?\d*)/.exec(str);
    // var reg_result = /^\s*([\+|\-]?)((?:0x|0X)?\d*)/.exec(str); //错误，[]中的"|"会作为一个字符匹配，而非“or”
    // 方法2与方法3大体一致，只是并列选择的时候在[]中插入了|元字符；
    // 方法1存在一些问题：exec('  123')等没有正负号的字符串时，第一个括号包含的是undefined，而非''空字符
    // 也可以如下避免undefined情况：
    // var reg_result = /^\s*((?:\+|\-)?)((?:0x|0X)?\d*)/.exec(str);
    var num_str = reg_result[2], decimal_flag = false;
    if (num_str.indexOf('0x') !== -1 || num_str.indexOf('0X') !== -1) {
        decimal_flag = true;
        num_str = num_str.slice(2);
    }
    // NOTE:不能先执行Number(radix)的转型，因为不传入radix，或者传入undefined的时候，默认为传入0
    // 也可以先判断，如果radix为undefined则置为0：
    // radix = radix === undefined ? 0 : Number(radix);
    // if (radix !== radix) return NaN;
    // if (radix === 0) {
    //    radix = decimal_flag ? 16 : 10;
    // }
    // if (radix > 36 || radix < 2) return NaN;
    radix = (radix === undefined || Number(radix) === 0) ? (decimal_flag ? 16 : 10) : Number(radix);
    //if (radix !== radix) return NaN;
    // if (radix > 36 || radix < 2) return NaN;
    // 如果radix为10则直接调用内部方法
    if (radix === 10) return Number(match_num_str);
    var num_arr = match_num_str.split('').reverse();
    for (var i = 0, len = num_arr.length; i < len; ++i) {
        if (num_arr[i] >= radix) {
            return i === 0 ? NaN : result;
        }
        else {
            result += Math.pow(radix, index) * Number(elem);
        }
    }
    return i === 0 ?  NaN : result; // 空字符串特殊处理
}
```

### xhr-promise
```js
function getURL(url) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.onload = function() {
            if (req.status === 200) {
                resolve(req.responseText);
            } else {
                reject(new Error(req.statusText));
            }
        };
        req.onerror = function() {
            reject(new Error(req.statusText));
        };
        req.send();
    });
}
```

```js
// xhr callback
function getURLCallback(url, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', url, ture);
    req.onload = function() {
        if (req.state === 200) {
            callback(null, req.responseText);
        } else {
            callback(new Error(req.statusText), req.responseText);
        }
    };
    req.onerror = function() {
        callback(new Error(req.statusText));
    };
    req.send();
}
```

```js
// multiple-xhr-callback
function getURLCallback(url, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function() {
        if (req.state === 200) {
            callback(null, req.responseText);
        } else {
            callback(new Error(req.statusText), req.reponstText);
        }
    };
    req.onerror = function() {
        callback(new Error(req.statusText));
    };
    req.send();
}

function jsonParse(callback, error, value) {
    if (error) {
        callback(error, value);
    } else {
        try {
            var result = JSON.parse(value);
            callback(null, result);
        } catch (e) {
            callback(e, value);
        }
    }
}

var request = {
    comment: function getComment(callback) {
        return getURLCallback('http://xxx.github.io/json/comment.json', jsonParse.bind(null, callback));
    },
    people: function getPeople(callback) {
        return getURLCallback('http://xxx.github.io/json/people.json', jsonParse.bind(null, callback));
    }
};

function allRequest(requests, callback, results) {
    if (requests.length === 0) {
        return callback(null, results);
    }

    var req = requests.shift();
    req(function (error, value) {
        if (error) {
            callback(error, value);
        } else {
            results.push(value);
            allRequest(requests, callback, results);
        }
        });
}

function main(callback) {
    allRequest([request.comment, request.people], callback, []);
}

main(function (error, results) {
    if (error) {
        return console.log(error);
    } else {
        console.log(results);
    }
});
```

### eval
```js
eval('(' + json + ')');
// 分组操作符，也就是添加的括号，会让解析器将JSON的花括号解析成表达式而不是代码块
// 代码块是一个语句，只能用于语句的语法环境
// 规范明确规定：表达式语句不能以关键字function开头
```

### Singletion
```js
var Singleton = (function () {
    var instantiated;
    function init() {
        // private property goes here...

        return {
            puclibMethod : function () {
                //....
            },
            publicProperty : "test"
        };
    }

    return {
        getInstance: function () {
            if (!instantiated) {
                instantiated = init();
            }
            return instantiated;
        }
    }
})();

// 其他需要通过new调用的单例实现方法：
function Universe() {
    var instance = this;
    this.a = XXX;
    this.b = XXXX;

    Universe = function() {
        return instance;
    };
}

function Universe() {
    if (typeof Universe.instance === 'object') {
        return Universe.instance;
    }
    this.aaa = XX;
    this.bbb = XXX;
    Universe.instance = this;
}

function Universe() {
    var instance;

    Universe = function Universe() {
        //console.log('inner Universe: ', instance);
        return instance;
    }

    Universe.prototype = this;
    instance = new Universe();
    this.constructor = Universe;
    instance.start_time = 0;
    instance.tag = 'test singleton';

    return instance;
}
```
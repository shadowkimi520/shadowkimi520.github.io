---
title: front-end-js
date: 2017-06-26 14:21:30
tags:
---

### DOM
* DOM是文档对象模型的缩写，它是html文档的对象表示，作为html元素的外部接口供js等调用；
* 在script标签中加入async属性来告诉浏览器，在执行js脚本时同时执行DOM构造；
* DOM树的构造由浏览器的渲染引擎执行，渲染引擎会通过解析文档来生成对应的DOM结构，并提供接口供JS执行引擎访问；
* 当浏览器遇到script标签时，文档的解析将停止，并立即下载并执行脚本，脚本执行完毕后将继续解析文档；
* async模式，文档的解析不会停止，其他线程将下载脚本，脚本下载完成后开始执行脚本，脚本执行的过程中文档将停止解析，直到脚本执行完毕；
* async异步执行的js文件被假定为不使用document.write向加载中的document写入内容，因此不要在异步执行的js文件的加载执行过程中使用document.write；
* defer模式，文档的解析不会停止，其他线程下载脚本，待文档解析完成，脚本才会执行；延迟脚本能访问完整的文档树，待延迟脚本都按序执行完后，浏览器在Document对象上触发DOMContentLoaded事件；
* 通常如果js不需要改变DOM结构时，可以使用async进行异步加载（比如一些统计代码可以异步加载，因为此代码与页面执行逻辑无关，不会改变DOM结构）
* defer async等**异步加载的**脚本中不能使用document.write，此处是异步加载，而非特指async属性脚本；**加载过程包括下载、解析和执行**
* alert在IE11中会阻塞浏览器渲染，也会阻塞后续代码执行；chrome中也一样；
* IE11和chrome中，脚本中的document.write()内容是会被立即添加到DOM中的，但不会立即被解析渲染出来，此时渲染引擎是阻塞的；如果输出的是不可见的script标签等，则引用的内容会立即创建链接进行下载，在当前脚本执行完后，渲染引擎处理document.write添加到DOM中的内部，并对脚本内容进行**同步加载**，即阻塞渲染引擎的后续处理；注意：如果有缓存，则行为可能不同；

### 动态(异步)加载javascript脚本

* script脚本的onload事件在脚本执行完成后触发，且在IE的readystate改变为complete之前；
* document.all只能用于判断是否为旧版本的IE浏览器，因为document.all属性在IE11等新版本浏览器中也是false
* 在IE11或者chrome中：typeof document.all => "undefined" ; Boolean(document.all) => false;
* document.all判断IE不靠谱，可以使用navigator.userAgent.indexOf('MSIE') !== -1;
* 异步执行的 js 文件被假定为不使用 document.write() 向加载中的 document 写入内容，因此不要在 **异步执行的** js 文件中使用 document.write()
* 除了 script 标签属性外，页面引入 js 文件的方式影响其加载执行方式：
&emsp;1).任何以添加 script 节点(例如 appendChild(scriptNode) )的方式引入的js文件都是异步执行的 (Node需要插入document中，只创建节点和设置src 是不会加载js文件的，这跟img的预加载不同)
&emsp;2).html文件中的&lt;script&gt;标签中的代码或src引用的js文件中的代码是同步加载和执行的
&emsp;3).html文件中的&lt;script&gt;标签中的代码使用document.write()方式引入的js文件是 ~~异步~~ (同步) 执行的，且IE11中预处理引擎不进行提前下载；
&emsp;4).html文件中的&lt;script&gt;标签src属性所引用的js文件的代码内再使用document.write()方式引入的js文件是同步执行的；如果标签引用js具有defer属性，而脚本中又通过动态方式加载其他脚本，那么IE11会不等待动态加载的脚本执行完就提前触发window的onload事件，chrome中在动态加载的脚本执行完之后才触发window上的onload事件；若为async属性，则IE11和chrome一致，均是等动态脚本执行完后才触发window的onload，且动态脚本的onload事件早于window的onload事件；

**不要**使用类似下面的做法，这样并不会发起加载js文件的请求：
`div.innerHTML = <script src='xxx.js'></script>;`
另外，window.onload事件会在js文件加载完毕才触发（即使是异步加载）

---
AJAX方式
```js
var xhr = getXHRObject();
xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    eval(xhr.responseText);
};
xhr.open('GET', src, true);
xhr.send('');
```
动态插入标签方式
```js
function asyncLoad(src) {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.type = "text/javascript";
    // 异步加载js
    script.onload = script.onreadystatechange = function() {
        // 这些readystate是针对IE8及以下的，W3C标准的script标签没有onreadystatechange和this.readyState,IE9以上同时支持onload和onreadystate
        // IE11开始不支持script元素的readyState属性，支持标准的onload事件，但如果是直接在script标签上指定的onstatechange属性，此时仍然会触发script上的onreadystatechange事件只是readyState获取不到正确值
        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
            help();
            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;
        }
    };
    // IE下有onreadystatechange事件， W3C标准有onload事件
    // ie8之前（包括）只支持onreadystatechange，而gecko,webkit浏览器和opera都支持onload
    // this.readyState理论上的状态变化步骤如下：
    * uninitialized
    * loading
    * loaded
    * interractive
    * complete
    // IE7中，只能获得loaded和complete中的一个，不能都出现，原因也许是对判断是不是从cache中读取影响了状态的变化
    script.src = src;
    head.appendChild(script);
}

// method 2:
function delay_js(src) {
    var script = document.createElement('script');
    script.setAttribute('src', src);
    script.setAttribute('type', "text/javascript");
    document.body.appendChild(script);
    return script;
}

function loadjs(src, succ) {
    var elem = delay_js(src);
    if (navigator.userAgent.indexOf('MSIE') !== -1) {
        elem.onreadystatechange = function() {
            if (/loaded|complete/.test(this.readyState)) {
                succ();
            }
        };
    } else {
        elem.onload = function() {
            succ();
        }
    }
    elem.onerror = function() {};
}
```

完备版本[https://gist.github.com/monjer/9183390]
---
```js
(function(exports) {
    function getScript(url, callback, charset) {
        if (!url) return;
        var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
        var script = document.createElement('script');
        script.src = url;
        script.async = true; // async load script, prevent block browser render(HTML5)
        script.charset = charset || 'utf-8';
        // standard(onload), IE(10-)(onreadystatechange)
        script.onload = script.onreadystatechange = function(){
            // standard || IE
            if (!script.readyState || /loaded|complete/.test(srcipt.readyState)) {
                script.parentNode.removeChild(script); // auto remove script node
                script.onload = script.onreadystatechange = null;
                scirpt = null;
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        }
        head.insertBefore(script);
    }
    exports.getScript = getScript;
})(exports);
// onload事件为script的标准事件
// onreadystatechange事件为IE浏览器特有事件，需要使用script.readyState属性来检测脚本是否加载完毕，IE11中已经不再支持script标签上的onreadystatechange事件和script.readyState属性，使用script.onload事件作为替代；
// script.async属性为HTML5新增的属性，可以用来以非阻塞方式加载脚本，不会block浏览器的渲染行为；其实以scriptNode方式插入的脚本都是异步加载的，可以不用设置该属性，因此在不支持async属性的浏览器中，我们可以通过该方式进行模拟；
```
/**
 * Created by xmg on 2017/2/21.
 */
(function (window, undefined) {

    // 用于创建njQuery对象的工厂方法
    var njQuery = function(selector) {
        return new njQuery.fn.init( selector );
    };

    // 修改njQuery的原型
    njQuery.fn = njQuery.prototype = {
            constructor: njQuery,
            init:  function (selector) {
                // 1.传入 '' null undefined NaN  0  false , 直接返回空对象, this
                if(!selector){
                    return this;
                }
                // 判断是否是Function
                else if(njQuery.isFunction(selector)){
                   njQuery.ready(selector);
                }
                // 2.传入的是字符串, 那么需要判断是选择器还是html代码片段
                else if(njQuery.isString(selector)){
                    // 0.为了防止用户是猴子派来的, 所以先去掉空格
                    selector = njQuery.trim(selector);
                    // 2.1如果是html代码片段, 会先根据html代码片段创建DOM元素, 然后将创建好的元素添加到jQ对象中
                    // 最简单的代码片段: <a>
                    // 先你判断是否以<开头, 再判断是否以>结尾, 再判断长度是否>=3
                    if(njQuery.isHTML(selector)){
                        // console.log('代码片段');
                        // 1.先手动创建一个DOM元素
                        var temp = document.createElement('div');
                        // 2.利用innerHTML将代码片段直接写入创建的DOM元素中
                        temp.innerHTML = selector;
                        /*
                         // 3.从临时的DOM元素中取出创建好的元素
                         for(var i = 0, len = temp.children.length; i < len; i++){
                         // console.log(temp.children[i]);
                         this[i] = temp.children[i];
                         }
                         // 4.给jQ对象添加lenght属性
                         this.length = temp.children.length;
                         */
                        /*
                         谁调用就push到谁上, 一般情况下都是利用数组调用, 所以都是push到了数组上
                         如果利用apply修改了push内部的this, 那么push就是push到修改之后的那个对象上
                         也就是说把push的this修改为了谁, 将来就push到谁上
                         apply有一个特点, 会将传入的参数依次取出来传入给指定的方法
                         */
                        [].push.apply(this, temp.children);
                    }
                    // 2.2如果是选择器, 将查找的DOM元素存储到当前jQ对象中返回
                    else{
                        // 1.根据传入的选择器在当前界面中查找对应的元素
                        var nodes = document.querySelectorAll(selector);
                        /*
                         // 2.将查找的DOM元素存储到当前jQ对象中返回
                         for(var i = 0, len = nodes.length; i < len; i++){
                         this[i] = nodes[i];
                         }
                         this.length = nodes.length;
                         */
                        [].push.apply(this, nodes);
                    }
                }
                // 3.传入的是数组, 会把数组/伪数组中的每一个项添加到jQ对象中
                else if(njQuery.isArraylike(selector)){
                    // 1.先将伪数组转化为真数组
                    selector = [].slice.call(selector);
                    // 2.再利用apply将真数组设置给jQ对象
                    [].push.apply(this, selector);
                }
                // 4.其它情况,直接把传入的内容添加到jQ对象中
                else{
                    this[0] = selector;
                    this.length = 1;
                }

            }
    };
    
    // 修改init函数的原型为njQuery的原型
    njQuery.fn.init.prototype = njQuery.fn;

    // 将内部创建的njQuery对象暴露给外界使用
    window.njQuery = window.$ = njQuery;

    /*
    直接写在这个地方弊端:
    1.随着代码量的增加, 后期不利于维护
    2.由于这里定义的都是一些工具方法, 所以我们希望大家都能使用, 但是由于定义在了init上, 外界无法访问init, 所以外界无法访问
    */
    // 给外界提供一个动态扩展静态属性/方法和实例属性/方法的方法
    njQuery.extend = njQuery.prototype.extend = function (obj) {
        for(var key in obj){
            this[key] = obj[key];
        }
    }
    
    // 扩展一些静态工具方法
    /*
    好处: 
    1.让外界可以使用内部工具方法
    2.将某个类型的工具方法集中到一起管理, 便于后期维护
    */
    njQuery.extend({
        // 判断是否是字符串
        isString : function (content) {
        return typeof content === 'string';
    },
        // 判断是否是HTML代码片段
        isHTML : function (html) {
            if(!njQuery.isString(html)){
                return false;
            }
            return html.charAt(0) === '<' &&
                html.charAt(html.length - 1) === '>' &&
                html.length >= 3;
        },
        // 取出两端空格
        trim : function (str) {
            // 1.判断是否是字符串, 如果不是就直接返回传入的内容
            if(!njQuery.isString(str)){
                return str;
            }
            // 2.判断当前浏览器是否支持自带的trim方法, 如果支持就用系统的
            if(str.trim){
                return str.trim();
            }else{
                return str.replace(/^\s+|\s+$/g, '');
            }
        },
        // 判断是否是对象
        isObject: function (obj) {
            // 对null特殊处理
            if(obj == null){
                return false;
            }
            return typeof obj === 'object';
        },
        // 判断是否是window
        isWindow: function (w) {
            return w.window === window;
        },
        // 判断是否是真/伪数组
        isArraylike : function (arr) {
            // 1.排除非对象和window
            if (!njQuery.isObject(arr) ||
                njQuery.isWindow(arr)){
                return false;
            }
            // 2.判断是否是真数组
            else if(({}).toString.apply(arr) === '[object Array]'){
                return true;
            }
            // 3.判断是否是伪数组
            else if('length' in arr &&
                (arr.length == 0 ||
                arr.length - 1 in arr)){
                return true;
            }
            return false;
        },
        // 判断是否是Function
        isFunction : function (fn) {
            return typeof fn === 'function';
        },
        ready: function (fn) {
            // 处理传入函数的情况
            // 1.直接判断当前document.readyState的状态
            if(document.readyState === 'complete'){
                fn();
            }
            // 2.判断当前浏览器是否支持addEventListener
            else if(document.addEventListener){
                addEventListener('DOMContentLoaded', fn);
            }
            // 3.如果当前浏览器不支持addEventListener, 那么我们就使用attachEvent
            else{
                document.attachEvent('onreadystatechange', function () {
                    // 由于onreadystatechange事件肯能触发多次, 所以需要进一步判断是否真正的加载完毕
                    if(document.readyState === 'complete'){
                        fn();
                    }
                });
            }
        }
    });
    
})(window);
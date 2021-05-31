'use strict';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

/** 渲染函数 */
var templateVDomCreateList = [{
  "type": "element",
  "tagName": "view",
  "attributes": [{
    "key": "style",
    "value": "color:red;"
  }],
  "children": [{
    "type": "element",
    "tagName": "view",
    "attributes": [],
    "children": [{
      "type": "text",
      "content": "我是第二层view"
    }]
  }, {
    "type": "element",
    "tagName": "view",
    "attributes": [],
    "children": [{
      "type": "element",
      "tagName": "view",
      "attributes": [{
        "key": "style",
        "value": "color:gray;"
      }, {
        "key": "class",
        "value": function value(data) {
          return "sax" + data.myClass + "xxxs";
        }
      }],
      "children": [{
        "type": "text",
        "content": function content(data) {
          return "我是第三层view" + data.showData + "";
        }
      }]
    }]
  }, {
    "type": "element",
    "tagName": "button",
    "attributes": [{
      "key": "type",
      "value": "primary"
    }, {
      "key": "size",
      "value": "samll"
    }, {
      "key": "loading",
      "value": function value(data) {
        return false;
      }
    }, {
      "key": "disabled",
      "value": function value(data) {
        return false;
      }
    }, {
      "key": "bindtap",
      "value": "myclick"
    }, {
      "key": "hover-class",
      "value": "hover-btn"
    }],
    "children": [{
      "type": "text",
      "content": "Button"
    }]
  }]
}];
/**
 * 根据data 构造渲染结果
 * @param data 
 */

function renderFunction() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // 遍历节点 将属性值为函数的都执行一遍 获得渲染结果
  var newVdoms = walkTemplateDoms(templateVDomCreateList, data); // console.log("newVdoms", JSON.stringify(newVdoms, null, 2));

  return newVdoms;
}
/**
 * 根据构建模板和数据构建出一颗渲染树
 * @param vdomList 
 * @param data 
 */


function walkTemplateDoms() {
  var vdomList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var len = vdomList.length; // 建立新的vdom 节点数组

  var newVDoms = [];

  for (var i = 0; i < len; i++) {
    // 取出遍历的节点
    var vdom = vdomList[i]; // 浅复制一遍属性到新的对象上

    var newVDom = _objectSpread2({}, vdom); // 如果是文本类型 则content有可能存在表达式


    if (newVDom.type === "text") {
      if (typeof vdom.content === "function") {
        newVDom.content = vdom.content(data);
      }
    } else {
      // 遍历属性
      var attributes = vdom.attributes || [];
      newVDom.attributes = walkTemplateAttributes(attributes, data); // 遍历子节点

      var children = vdom.children || [];
      newVDom.children = walkTemplateDoms(children, data);
    } // 将复制出来的节点放到新列表上


    newVDoms.push(newVDom);
  }

  return newVDoms;
}
/**
 * 遍历节点的属性值 将value值是function的先执行
 * @param attributes 属性数组
 * @param data 数据
 * @returns 新的属性数组
 */


function walkTemplateAttributes() {
  var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var len = attributes.length; // 构建新的数组存储属性

  var newAttributes = [];

  for (var i = 0; i < len; i++) {
    var attribute = attributes[i]; // 浅复制一遍

    var newAttribute = Object.assign({}, attribute);

    if (typeof attribute.value === "function") {
      newAttribute.value = attribute.value(data);
    }

    newAttributes.push(newAttribute);
  }

  return newAttributes;
}
/** 页面运行时函数 */


var BASE_KEY = ['data', 'onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage'];
var CAN_RUN_BASE_KEY = ["onShow", "onHide", "onUnload", "onPullDownRefresh", "onReachBottom", "onShareAppMessage"]; // const page = {
//   onShow: function(){}
// } // 页面实例

function Page(pageObj) {
  console.log("pageObj", pageObj); // 收集去除基本属性的属性key列表

  var keys = Object.keys(pageObj).filter(function (key) {
    return BASE_KEY.indexOf(key) === -1;
  }); // console.log("keys", keys);
  // 将这些属性对应的函数绑定给真正的页面实例 以便触发

  keys.map(function (key) {
    var value = pageObj[key];
    console.log("key isfunction", key, typeof value === "function");

    if (typeof value === "function") {
      Object.defineProperty(page, key, {
        get: function get() {
          return function () {
            console.log("执行了defineProperty 的 key 方法", key);
            var args = Array.prototype.slice.call(arguments);
            value.apply(pageObj, args);
          };
        }
      }); // page[key] = function(...args){
      //   console.log("page function", key);
      //   value.apply(pageObj, args)
      // }
    }
  }); // 处理会运行的生命周期 onshow onhide 这些运行时会运行的

  CAN_RUN_BASE_KEY.map(function (key) {
    // 暂存旧的生命周期
    var oldFunc = page[key]; // 重写生命周期

    page[key] = function () {
      // 运行旧的生命周期
      if (typeof oldFunc === "function") {
        oldFunc.call(page);
      } // 运行新的生命周期


      if (typeof pageObj[key] === "function") {
        pageObj[key]();
      }
    };
  }); // 给页面增加页面渲染函数

  pageObj.render = function (callback) {
    var vdoms = renderFunction(this.data);
    page.setData({
      vdoms: vdoms
    }, callback);
  }; // 处理内部页面的setData


  pageObj.setData = function () {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments.length > 1 ? arguments[1] : undefined;
    // TODO: 没有处理 'a.b.c': 777 的情况
    this.data = _objectSpread2(_objectSpread2({}, this.data), obj);
    this.render(callback);
  }; // 处理不会运行的生命周期函数
  // 页面加载


  if (typeof pageObj.onLoad === "function") {
    pageObj.onLoad();
  }

  pageObj.render(); // 页面渲染完成

  if (typeof pageObj.onReady === "function") {
    pageObj.onReady();
  }
}
/** 原有页面处理逻辑 */
// test/index.js


Page({
  /**
   * 页面的初始数据
   */
  data: {
    myClass: "myclass",
    showData: "showData"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    this.time = 0;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},
  myclick: function myclick() {
    console.log("i click ");
    this.time++;
    this.setData({
      showData: "改变showdata" + this.time
    });
  }
});

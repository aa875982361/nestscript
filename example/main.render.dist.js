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
var vdoms = renderFunction({
  myClass: "我是自定义class",
  showData: "我是show的data"
});
page.setData({
  vdoms: vdoms
});
/**
 * 根据data 构造渲染结果
 * @param data 
 */

function renderFunction() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // 遍历节点 将属性值为函数的都执行一遍 获得渲染结果
  var newVdoms = walkTemplateDoms(templateVDomCreateList, data);
  console.log("newVdoms", JSON.stringify(newVdoms, null, 2));
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

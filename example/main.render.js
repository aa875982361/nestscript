
const templateVDomCreateList = [
  {
    "type": "element",
    "tagName": "view",
    "attributes": [
      {
        "key": "style",
        "value": "color:red;"
      }
    ],
    "children": [
      {
        "type": "element",
        "tagName": "view",
        "attributes": [],
        "children": [
          {
            "type": "text",
            "content": "我是第二层view"
          }
        ]
      },
      {
        "type": "element",
        "tagName": "view",
        "attributes": [],
        "children": [
          {
            "type": "element",
            "tagName": "view",
            "attributes": [
              {
                "key": "style",
                "value": "color:gray;"
              },
              {
                "key": "class",
                "value": function (data){
      return "sax"+(data.myClass)+"xxxs"
    }
              }
            ],
            "children": [
              {
                "type": "text",
                "content": function (data){
      return "我是第三层view"+(data.showData)+""
    }
              }
            ]
          }
        ]
      },
      {
        "type": "element",
        "tagName": "button",
        "attributes": [
          {
            "key": "type",
            "value": "primary"
          },
          {
            "key": "size",
            "value": "samll"
          },
          {
            "key": "loading",
            "value": function (data){
      return false
    }
          },
          {
            "key": "disabled",
            "value": function (data){
      return false
    }
          },
          {
            "key": "bindtap",
            "value": "myclick"
          },
          {
            "key": "hover-class",
            "value": "hover-btn"
          }
        ],
        "children": [
          {
            "type": "text",
            "content": "Button"
          }
        ]
      }
    ]
  }
];
const vdoms = renderFunction({
  myClass: "我是自定义class",
  showData: "我是show的data"
})
page.setData({
  vdoms
})
/**
 * 根据data 构造渲染结果
 * @param data 
 */
function renderFunction(data = {}){
  // 遍历节点 将属性值为函数的都执行一遍 获得渲染结果
  const newVdoms = walkTemplateDoms(templateVDomCreateList, data)
  console.log("newVdoms", JSON.stringify(newVdoms, null, 2));
  return newVdoms
}

/**
 * 根据构建模板和数据构建出一颗渲染树
 * @param vdomList 
 * @param data 
 */
function walkTemplateDoms(vdomList = [], data = {}){
  const len = vdomList.length
  // 建立新的vdom 节点数组
  const newVDoms = []
  for(let i = 0; i < len; i++){
    // 取出遍历的节点
    const vdom = vdomList[i];
    // 浅复制一遍属性到新的对象上
    const newVDom = {...vdom}
    // 如果是文本类型 则content有可能存在表达式
    if(newVDom.type === "text"){
      if(typeof vdom.content === "function"){
        newVDom.content = vdom.content(data)
      }
    }else{
      // 遍历属性
      const attributes = vdom.attributes || []
      newVDom.attributes = walkTemplateAttributes(attributes, data)
      // 遍历子节点
      const children = vdom.children || []
      newVDom.children = walkTemplateDoms(children, data)
    }
    // 将复制出来的节点放到新列表上
    newVDoms.push(newVDom)
  }
  return newVDoms
}

/**
 * 遍历节点的属性值 将value值是function的先执行
 * @param attributes 属性数组
 * @param data 数据
 * @returns 新的属性数组
 */
function walkTemplateAttributes(attributes = [], data = {}){
  const len = attributes.length;
  // 构建新的数组存储属性
  const newAttributes = []
  for(let i = 0; i < len; i++){
    const attribute = attributes[i]
    // 浅复制一遍
    const newAttribute = Object.assign({}, attribute)
    if(typeof attribute.value === "function"){
      newAttribute.value = attribute.value(data)
    }
    newAttributes.push(newAttribute)
  }
  return newAttributes
}

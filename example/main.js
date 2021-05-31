console.log("hello plinghuang");
console.log("page", page);

page.myclick = function(){
  console.log("myclick")
}

page.setData({
  vdom: "我是帅哥",
  vdoms: [
    {
      type: "view",
      children: [
        {
          text: "我是一个view"
        },
        {
          type: "view",
          children: [{
            text: "我是嵌套在内部的view"
          }]
        }
      ],
    },
    {
      type: "button",
      children: [
        {
          text: "我是一个button"
        }
      ],
      tap: "myclick"
    }
  ]
})
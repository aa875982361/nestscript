const BASE_KEY = [
  'data',
  'onLoad',
  'onReady',
  'onShow',
  'onHide',
  'onUnload',
  'onPullDownRefresh',
  'onReachBottom',
  'onShareAppMessage',
]
const CAN_RUN_BASE_KEY = ["onShow", "onHide", "onUnload", "onPullDownRefresh", "onReachBottom", "onShareAppMessage"]
// const page = {
//   onShow: function(){}
// } // 页面实例
function Page(pageObj){
  console.log("pageObj", pageObj);
  // 收集去除基本属性的属性key列表
  const keys = Object.keys(pageObj).filter((key)=>{
    return BASE_KEY.indexOf(key) === -1
  })
  // console.log("keys", keys);
  // 将这些属性对应的函数绑定给真正的页面实例 以便触发
  keys.map(key=>{
    const value = pageObj[key]
    console.log("key isfunction", key, typeof value === "function");
    if(typeof value === "function"){
      Object.defineProperty(page, key, {
        get: function(){
          return function(){
            console.log("执行了defineProperty 的 key 方法", key);
            const args = Array.prototype.slice.call(arguments);
            value.apply(pageObj, args)
          }
        }
      })
      // page[key] = function(...args){
      //   console.log("page function", key);
      //   value.apply(pageObj, args)
      // }
    }
  })
  // 处理会运行的生命周期 onshow onhide 这些运行时会运行的
  CAN_RUN_BASE_KEY.map(key=>{
    // 暂存旧的生命周期
    const oldFunc = page[key]
    // 重写生命周期
    page[key] = function(){
      // 运行旧的生命周期
      if(typeof oldFunc === "function"){
        oldFunc.call(page)
      }
      // 运行新的生命周期
      if(typeof pageObj[key] === "function"){
        pageObj[key]()
      }
    }
  })
  // 给页面增加页面渲染函数
  pageObj.render = function(callback){
    const vdoms = renderFunction(this.data);
    page.setData({
      vdoms
    }, callback)
  }
  // 处理内部页面的setData
  pageObj.setData = function(obj = {}, callback){
    // TODO: 没有处理 'a.b.c': 777 的情况
    this.data = {
      ...this.data,
      ...obj,
    }
    this.render(callback)
  }

  // 处理不会运行的生命周期函数
  // 页面加载
  if(typeof pageObj.onLoad === "function"){
    pageObj.onLoad()
  }
  
  pageObj.render()
  // 页面渲染完成
  if(typeof pageObj.onReady === "function"){
    pageObj.onReady()
  }
}

/**
 * 给ctx对象添加ajax请求返回数据函数中间件
 */

module.exports = async function (ctx, next) {
  // 成功
  ctx.success = (msg) => {
    let obj = new Object;
    if(typeof msg == 'object') 
      obj = msg;
    else if(typeof msg == 'string') 
      obj.msg = msg;
    
    obj.status = 0;
    return ctx.body = obj;
  };
  // 失败
  ctx.error = (msg, status) => {
    return ctx.body = {
      status: status || 1,
      msg: msg
    }
  };
  await next();
}
/**
 * 给ctx对象添加ajax请求返回数据函数中间件
 */


function data (ctx,status) {
  return (msg) => {
    let obj = new Object;
    if(typeof msg == 'object') 
      obj = msg;
    else if(typeof msg == 'string') 
      obj.message = msg;
    
    obj.status = status;
    return ctx.body = obj;
  }
}

module.exports = async function (ctx, next) {
  // 成功
  ctx.success = data(ctx, 0);
  // 失败
  ctx.error = data(ctx, 1);

  await next();
}
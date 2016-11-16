/**
 * 给ctx对象添加ajax请求返回数据函数中间件
 */



/**
 * 根据请求信息和请求类型返回数据
 * - ctx {Object} 上下文对象
 * - status {Int} 0 状态码
 * return {Function} 
 */
function data (ctx,status) {
  /**
   * 返回信息函数
   * - msg {String||Object} 返回信息说明
   * - obj {Object} 其它需要返回的函数
   */
  return async (msg, obj) => {
    obj = obj || new Object;
    if(typeof msg == 'object') 
      obj = msg;
    else if(typeof msg == 'string') 
      obj.message = msg;
    
    obj.title = '提示';
    obj.status = status;
    if(ctx.headers['x-requested-with'] === 'XMLHttpRequest') {
      return ctx.body = obj;
    } else { 
       return await ctx.render('alert', obj);
    }
  }
}

module.exports = async function (ctx, next) {
  if(!ctx.success)
    // 成功
    ctx.success = data(ctx, 0);
  if(!ctx.error)
    // 失败
    ctx.error = data(ctx, 1);

  await next();
}
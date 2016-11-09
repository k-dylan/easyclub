
/**
 * 为jade添加 partial 局部模板方法
 */

const jade = require('jade');
const path = require('path');

/**
 * 为 jade 添加 partial 方法
 * 
 * @param {String} viewPath 模板文件根目录
 * @returns
 */
module.exports = function (viewPath) {
  return async function (ctx, next) {
    if(!ctx.state.hasOwnProperty('partial')) {
      /**
       * 局部模板函数
       * 
       * @param {String} pathname 要调用的局部模板路径，相对于模板文件夹
       * @param {Object} data 模板内部变量
       * @returns
       */
      ctx.state.partial = (pathname, data) => {
        if(!pathname) return ;

        if(path.extname(pathname) != '.jade') 
          pathname += '.jade';
        
        if(typeof data === 'object')
          data = Object.assign(data, ctx.state);

        let fn = jade.compileFile(path.join(viewPath, pathname));
        return fn(data);
      }
    }
    await next();
  }
}


 
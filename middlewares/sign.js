


/**
 * 检测是否登录
 */
let isLogin = exports.isLogin = async function (ctx, next) {
  if(!ctx.state.current_user) {
    return ctx.error("您还未登录，请登录后重试！", {
      jump: '/user/login'
    });
  } 
  await next();
} 

/**
 * 是否是管理员
 */
exports.isAdmin = async function isAdmin (ctx, next) {
  if(ctx.state.current_user && ctx.state.current_user.isAdmin) {
    return await next();
  } else {
    return ctx.error("您不是管理员，无法执行该操作！");
  }
}
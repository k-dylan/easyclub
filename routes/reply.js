const router = require('koa-router')();
const validator = require('validator');
const sign = require('../middlewares/sign');

/**
 * 编辑回复页面
 */
router.get('/:reply_id/edit', sign.isLogin, Verify, async (ctx, next) => {
  return await ctx.render('reply/edit', {
    title: '编辑回复',
    reply: ctx.reply
  })
})
/**
 * 更新回复内容
 */
router.post('/:reply_id/edit', sign.isLogin, Verify, async (ctx, next) => {
  
  let reply = ctx.reply;
  let content = validator.trim(ctx.request.body.content);

  if(!content) return ctx.error('您请求的参数有误，请检查后重试！');

  reply.content = content;
  reply.update_time = Date.now();
  try {
    await reply.save();
    return ctx.redirect(`/topic/${reply.topic_id}#${reply._id}`);
  } catch (e) {
    // todo:// 记录日志
    return ctx.error('保存失败，请重试！');
  }
});

/**
 * 删除回复
 */
router.get('/:reply_id/delete', sign.isLogin, Verify, async (ctx, next) => {
  
  let reply = ctx.reply;

  reply.deleted = true;
  try {
    await reply.save();

    let user = await ctx.model('user').updateReplyCount(reply.author_id, -1);
    if(user._id.toString() === reply.author_id.toString()) 
      ctx.session.user = user.toObject();
    return ctx.success('删除成功！');
  } catch (e) {
    console.log(e);
    // todo:// 记录日志
    return ctx.error('删除失败！');
  }
});

/**
 * 验证用户是否有权限执行此操作
 */
async function Verify (ctx, next) {
  let reply_id = ctx.params.reply_id;

  if(!validator.isMongoId(reply_id)) 
    return ctx.error('您请求的参数有误，请检查后重试！');

  let reply = await ctx.model('reply').findById(reply_id);

  if(!reply) {
    return ctx.error('没有找到此回复！');
  }

  if(!(ctx.state.current_user.isAdmin || ctx.state.current_user._id.toString() === reply.author_id.toString())){
    return ctx.error('您没有权限执行此操作！');
  }
  ctx.reply = reply;
  return next();
}

module.exports = router;
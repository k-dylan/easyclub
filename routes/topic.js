

const router = require('koa-router')();
const config = require('../config');

/**
 * 发表主题页面
 */
router.get('/create', check_login_middle, async (ctx, next) => {
  await ctx.render('topic/create', {
    title: '发表话题',
    tags: config.tags
  });
});

/**
 * 发表主题
 */
router.post('/', check_login_middle, async (ctx, next) => {
  let body = ctx.request.body;
  if(!body.title || !body.tag || !body.content)
    return ctx.body = {
      status: 1,
      message: '参数有误!'
    };
  
  let user_id = ctx.state.username_id;
  let Topic = ctx.model('topic');
  
  // 添加文章
  let topic = new Topic({
    title: body.title,
    tag: body.tag,
    content: body.content,
    author_id: user_id
  });
  
  let result = await topic.saveQ();
  
  if(result) {
    // 更新用户主题数
    let User = ctx.model('user');
    let res = await User.update_topic_count(user_id, 1);
    ctx.body = {
      status: 0,
      topic_id: result._id
    }
  } else {
    ctx.body = {
      status: 1,
      message: '出现错误，保存失败！'
    }
  }
  
  
})


async function check_login_middle (ctx, next) {
  // 验证是否登录
  if(!ctx.state.username) {
    return await ctx.render('error', {
      title: '错误',
      message: '请先登录!',
      jump: '/user/login'
    });
  } 
  await next();
} 

module.exports = router;
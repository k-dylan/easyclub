

const router = require('koa-router')();
const config = require('../config');
const markdown = require('markdown-it');
const Promise = require('promise');

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
    return ctx.error('您请求的参数不完整！');
  
  let user_id = ctx.state.user._id;
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
    ctx.success({
      topic_id: result._id
    });
  } else {
    ctx.error("出现错误，保存失败！");
  }
});
/**
 * 查看主题
 */
router.get('/:topic_id', async (ctx, next) => {
  let topic_id = ctx.params.topic_id;
  let Topic = ctx.model('topic');
  
  let topic = await Topic.get_topic(topic_id);
  
  if(!topic || topic.deleted) {
    return await ctx.render('error', {
      title: '错误',
      message: '您要查看的文章已删除！',
      jump: '-1'
    });
  }
  // 转换markdown文档
  let md = new markdown();
  
  // 读取回复内容
  let Reply = ctx.model('reply');
  let replys = await Reply.findQ({
    topic_id: topic_id,
    deleted: false
  },'' ,{sort: 'create_time'});

  // 读取回复的用户
  let User = ctx.model('user');
  
  replys = await Promise.all(replys.map( async (reply) => {
    reply.author = await User.findOneQ({
      _id: reply.author_id
    });
    return reply;
  }));

  // 读取主题作者
  topic.author = await User.findOneQ({
    _id: topic.author_id
  });

  // 读取作者其它主题
  topic.author_topic_list = await Topic.find({
    author_id: topic.author
  }).sort({
    create_time: -1
  }).limit(10).select('title');


  await ctx.render('topic/show', {
    title: topic.title,
    topic: topic,
    replys: replys,
    md: md
  });
});

/**
 * 回复主题
 */
router.post('/:topic_id/reply', check_login_middle, async (ctx, next) => {
  let content = ctx.request.body.content;
  
  if(!content) {
    return ctx.error('您请求的参数有误，请检查后重试！');
  }
  
  let Reply = ctx.model('reply');
  
  let user_id = ctx.state.user._id;
  let topic_id = ctx.params.topic_id;
  let reply = new Reply({
    content: content,
    topic_id: topic_id,
    author_id: user_id
  });
  
  let result = await reply.saveQ();

  if(result) {
    // 更新回复数
    let User = ctx.model('user');
    await User.update_reply_count(user_id, 1);
    
    // 更新主题
    let Topic = ctx.model('topic');
    let res = await Topic.reply(topic_id, result._id);

    if(res.ok) {
      return ctx.success({
        topic_id: topic_id,
        reply_id: result._id
      })
    } else {
      return ctx.error('回复失败，请重试！');
    }
  }
});



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
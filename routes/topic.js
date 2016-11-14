

const router = require('koa-router')();
const config = require('../config');
const markdown = require('markdown-it');
const Promise = require('promise');
const tools = require('../common/tools');
const validator = require('validator');
const sign = require('../middlewares/sign');

/**
 * 发表主题页面
 */
router.get('/create', sign.isLogin, async (ctx, next) => {
  await ctx.render('topic/create', {
    title: '发表话题',
    tags: config.tags
  });
});

/**
 * 发表主题
 */
router.post('/', sign.isLogin, async (ctx, next) => {
  let body = tools.trimObjectValue(ctx.request.body);
  
  if(!body.title || !body.tag || !body.content)
    return ctx.error('您请求的参数不完整！');
  
  let user_id = ctx.state.current_user._id;
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
    let user = await User.updateTopicCount(user_id, 1);
    // 更新session
    ctx.session.user = user.toObject();
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
  
  let isAdmin = ctx.state.current_user && ctx.state.current_user.isAdmin;
  if(!topic || (!isAdmin && topic.deleted)) {
    return ctx.error('您要查看的文章不存在或已删除！',{
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
  }).limit(10).select('title').execQ();


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
router.post('/:topic_id/reply', sign.isLogin, async (ctx, next) => {

  let topic_id = ctx.params.topic_id;
  if(!validator.isMongoId(topic_id)) {
    return ctx.error('您请求的参数有误，请检查后重试！');
  }

  let body = tools.trimObjectValue(ctx.request.body);

  let content = body.content;

  if(!content) {
    return ctx.error('您请求的参数有误，请检查后重试！');
  }
  
  let Reply = ctx.model('reply');

  let user_id = ctx.state.current_user._id;
  
  let reply = new Reply({
    content: content,
    topic_id: topic_id,
    author_id: user_id
  });
  
  let result = await reply.saveQ();

  if(result) {
    // 更新回复数
    let User = ctx.model('user');
    let user = await User.updateReplyCount(user_id, 1);
    ctx.session.user = user.toObject();
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

/**
 * 置顶帖子
 */
router.get('/:topic_id/top', sign.isAdmin, async (ctx, next) => {

  let topic_id = ctx.params.topic_id;
  if(!validator.isMongoId(topic_id)) {
    return ctx.error('您请求的参数有误，请检查后重试！');
  }

  let Topic = ctx.model('topic');
  let topic = await Topic.findOneQ({
    _id: topic_id
  });

  topic.top = !topic.top;
  await topic.saveQ();

  ctx.success('操作成功', {
    top: topic.top
  });
});

/**
 * 删除帖子
 */
router.get('/:topic_id/delete', sign.isAdmin, async (ctx, next) => {
  let topic_id = ctx.params.topic_id;
  if(!validator.isMongoId(topic_id)) {
    return ctx.error('您请求的参数有误，请检查后重试！');
  }

  let Topic = ctx.model('topic');
  let topic = await Topic.findOneQ({
    _id: topic_id
  });

  if(!topic || topic.deleted) {
    return ctx.error('此话题不存在或已被删除！');
  }

  topic.deleted = true;
  await topic.saveQ();

  // 用户话题数减 1
  let user = await ctx.model('user').updateTopicCount(topic.author_id, -1);
  if(ctx.state.current_user && ctx.state.current_user._id.toString() === user._id.toString()){
    ctx.session.user = user.toObject();
  }

  return ctx.success('操作成功！话题已被删除');
})

module.exports = router;
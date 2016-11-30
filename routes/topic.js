

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
  await ctx.render('topic/edit', {
    title: '发表话题',
    tags: config.tags
  });
});

/**
 * 编辑主题页面
 */
router.get('/:topic_id/edit', sign.isLogin, async (ctx, next) => {
  let topic_id = ctx.params.topic_id;
  if(!validator.isMongoId(topic_id)) return ctx.error('您请求的参数有误，请重试！');

  let topic = await ctx.model('topic').findById(topic_id);

  if(!topic || topic.deleted) return ctx.error('您要编辑的话题不存在或已删除！');

  if(!(ctx.session.user.isAdmin || ctx.session.user._id.toString() === topic.author_id.toString()))
    return ctx.error('您没有权限编辑此话题！');

  await ctx.render('topic/edit', {
    title: '编辑话题',
    tags: config.tags,
    topic: topic
  })
});

/**
 * 更新主题
 */
router.post('/:topic_id/edit', sign.isLogin, async (ctx, next) => {
  let topic_id = ctx.params.topic_id;
  if(!validator.isMongoId(topic_id)) return ctx.error('您请求的参数有误，请重试！');
  
  let topic = await ctx.model('topic').findById(topic_id);
  if(!topic || topic.deleted) return ctx.error('您要编辑的话题不存在或已删除！');
 
  if(!(ctx.session.user.isAdmin || ctx.session.user._id.toString() === topic.author_id.toString()))
    return ctx.error('您没有权限编辑此话题！');
  
  let body = tools.trimObjectValue(ctx.request.body);
  if(!body.title || !body.tag || !body.content)
    return ctx.error('您请求的参数不完整！');
  
  topic.title = body.title;
  topic.tag = body.tag;
  topic.content = body.content;
  topic.update_time = Date.now();

  let result = await topic.saveQ();
  if(result) {
    return ctx.success({
      topic_id: result._id
    });
  } else {
    return ctx.error("出现错误，保存失败！");
  }
})

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
  },null ,{sort: 'create_time'});

  // 读取回复的用户
  let User = ctx.model('user');
  
  replys = await Promise.all(replys.map( async (reply) => {
    reply.author = await User.findById(reply.author_id, 'username avatar');
    return reply;
  }));

  [topic.author, topic.author_topic_list] = await Promise.all([
    User.findById(topic.author_id),  // 读取主题作者
    Topic.find({                    //  读取作者其它主题
      author_id: topic.author_id,
      deleted: false
    }, 'title', {
      sort: '-create_time',
      limit: 10
    })
  ]);

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
    let [user, res] = await Promise.all([
      // 更新用户回复数
      ctx.model('user').updateReplyCount(user_id, 1),
      // 更新主题最后回复
      ctx.model('topic').reply(topic_id, result._id)
    ]);
    // 更新用户session
    ctx.session.user = user.toObject();

    if(res.ok) {
      ctx.redirect(`/topic/${topic_id}#${result._id}`);
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
  let topic = await Topic.findById(topic_id);

  topic.top = !topic.top;
  await topic.saveQ();

  ctx.success('操作成功', {
    top: topic.top
  });
});

/**
 * 删除/恢复帖子
 */
router.get('/:topic_id/delete', sign.isAdmin, async (ctx, next) => {
  let topic_id = ctx.params.topic_id;
  if(!validator.isMongoId(topic_id)) {
    return ctx.error('您请求的参数有误，请检查后重试！');
  }

  let Topic = ctx.model('topic');
  let topic = await Topic.findById(topic_id);

  if(!topic) {
    return ctx.error('此话题不存在！');
  }

  topic.deleted = !topic.deleted;
  await topic.saveQ();

  // 用户话题数减 1
  let count = topic.deleted ? -1 : 1;
  let user = await ctx.model('user').updateTopicCount(topic.author_id, count);
  // 如果被删除帖子的用户是正在登录的用户，则更新该用户的session数据
  if(ctx.state.current_user && ctx.state.current_user._id.toString() === user._id.toString()){
    ctx.session.user = user.toObject();
  }
  if(topic.deleted)
    return ctx.success('操作成功！话题已被删除', {
      deleted: true
    });
  else 
    return ctx.success('操作成功！话题已被恢复', {
      deleted: false
    })
})


module.exports = router;
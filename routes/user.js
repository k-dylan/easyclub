const router = require('koa-router')();
const config = require('../config');
const validator = require('validator');
const tools = require('../common/tools');
const markdown = require('markdown-it');
const upload = require('../common/upload');
const sign = require('../middlewares/sign');

/**
 * 用户设置
 */
router.get('/setting', sign.isLogin, async (ctx, next) => {
  let User = ctx.model('user');
  let user = await User.findOneQ({
    username: ctx.state.current_user.username
  });
  await ctx.render('user/setting', {
    title: '用户中心',
    user: user
  });
});

/**
 * 修改用户信息
 */
router.post('/', sign.isLogin, async (ctx, next) => {
  let body = tools.trimObjectValue(ctx.request.body);

  let User = ctx.model('user');

  let user = await User.findOneQ({
    username: ctx.state.current_user.username
  });
  
  if(!validator.isEmail(body.email)){
    return ctx.error('email格式不正确，请检查后重试！');
  }

  user.email = body.email;
  user.home = body.home;
  user.github = body.github;
  user.signature = body.signature;

  let result = await user.saveQ();
  
  if(result) {
    ctx.session.user = user.toObject();
    return ctx.success();
  } else {
    return ctx.error('请求失败');
  }
});
/**
 * 修改密码
 */
router.post('/setpass', sign.isLogin, async (ctx, next) => {
  let body = tools.trimObjectValue(ctx.request.body);
  let oldpass = body.oldpass;
  let newpass = body.newpass;

  if(!oldpass || !newpass) {
    return ctx.error('请求参数不完整！');
  }

  let User = ctx.model('user');

  let user = await User.check_password(ctx.state.current_user.username, oldpass);

  if(!user) {
    return ctx.error('当前密码输入错误，请检查后重试！');
  }

  user.password = newpass;
  let result = await user.saveQ();

  if(!result) {
    return ctx.error('保存失败，请检查后重试！');
  }
  // 重新登录
  ctx.session.user = null;
  ctx.success('修改成功，请重新登录！');

});

/**
 * 注册页面
 */
router.get('/register', async (ctx, next) => {  
  await ctx.render('user/register', {
    title: '用户注册' 
  });
});


/**
 * 接收注册信息
 */
router.post('/register', async (ctx, next) => {
  let body = tools.trimObjectValue(ctx.request.body);
  if(!validator.isEmail(body.email)) {
    return ctx.error('email格式不正确，请检查后重试！');
  }

  if(!body.username || !body.password || !body.email)
    return ctx.error('您请求的参数不完整!');
  
  let User = ctx.model('user');
  // 验证用户名是否重复
  let user = await User.findOneQ({
    username: body.username
  });
  
  if(user) {
    return ctx.error('用户名已注册过啦！');
  }; 
  // 验证邮箱
  user = await User.findOneQ({
    email: body.email
  });
  
  if(user) {
    return ctx.error('此邮箱已经注册过啦！');
  }; 

  user = new User(body); 
  let result = await user.saveQ();
  if(result)
    return ctx.success();
  else
    return ctx.error('注册失败！');
});


/**
 * 登录页面
 */
router.get('/login', async (ctx, next) => {
  await ctx.render('user/login', {
    title: '用户登录'
  })
});


/**
 * 登录处理
 */
router.post('/login', async (ctx, next) => {
  let body = tools.trimObjectValue(ctx.request.body);
  let User = ctx.model('user');
  let user = await User.check_password(body.username, body.password);
  
  if(!user) {
    return ctx.error('没有此用户或密码错误！');
  }
  // 用户名密码正确
  ctx.session.user = user.toObject();
  
  return ctx.success();
});
/**
 * 退出登录
 */
router.get('/logout', (ctx, next) => {
  ctx.session.user = null;
  ctx.redirect('/');
})

/**
 * 设置头像
 */
router.post('/setavatar', sign.isLogin, async (ctx, next) => {
  try {
    // 保存图片
    await upload.single('avatar')(ctx); 
  }catch(e) {
    if(e.code === 'LIMIT_FILE_SIZE') {
      return ctx.error('您上传的图片过大，请选择小于 ' + config.upload.fileSize / 1024 / 1024 + 'MB的图片');
    }
    return ctx.error(e.message);
  }

  if(!ctx.req.file)
    return ctx.error('发生错误，请检查后重试！');

  let User = ctx.model('user');
  let user = await User.findOneQ({
    _id: ctx.session.user._id
  });

  user.avatar = ctx.req.file.filename;
  await user.saveQ()

  ctx.session.user = user.toObject();
  ctx.redirect('/user/setting#setavatar');
})

/**
 * 用户首页
 */
router.get('/:username', async (ctx, next) => {
  let username = validator.trim(ctx.params.username);
  let User = ctx.model('user');
  let user = await User.findOneQ({
    username: username
  });
  if(!user) {
    return ctx.error('没有找到此用户！');
  }

  let Topic = ctx.model('topic');
  // 查询用户帖子
  let topics = await Topic.find({
      author_id: user._id,
      deleted: false
    }, null, {
      sort: {create_time: -1},
      limit: 5
    });

  let replys = await ctx.model('reply').find({
    author_id: user._id
  }, null, {
    sort: {update_time: -1},
    limit: 5
  });
  
  replys = await Promise.all(replys.map(async (reply) => {
    reply.topic = await Topic.findOneQ({
      _id: reply.topic_id
    });
    return reply;
  }));

  
  await ctx.render('user/home', {
    title: username + '的个人主页',
    user: user,
    topics: topics,
    replys: replys,
    md: new markdown()
  })
});

/**
 * 用户回复页
 */
router.get('/:username/reply', async (ctx, next) => {
  let username = validator.trim(ctx.params.username);
  let User = ctx.model('user');
  let user = await User.findOneQ({
    username: username
  });
  if(!user) {
    return ctx.error('没有找到此用户！');
  }

  let currentPage = +ctx.query.page || 1;

  let Topic = ctx.model('topic');
  let result = await ctx.model('reply').getReplyForPage({
    author_id: user._id
  }, null,  {
    sort: '-update_time'
  }, currentPage, config.pageSize, config.showPageNum);

  let replys = result.data;

  
  replys = await Promise.all(replys.map(async (reply) => {
    reply.topic = await Topic.findOneQ({
      _id: reply.topic_id
    });
    return reply;
  }));

  await ctx.render('user/replys', {
    title: username + '的个人主页',
    user: user,
    replys: replys,
    page: result.page,
    md: new markdown()
  })
});


/**
 * 用户话题页
 */
router.get('/:username/topic', async (ctx, next) => {
  let username = ctx.params.username;

  let user = await ctx.model('user').findOneQ({
    username: username
  });

  if(!user) {
    return ctx.error('这个用户不存在，请重试！');
  }

  let current_page = +ctx.query.page || 1;
  let query = {
    author_id: user._id
  }
  let Topic = ctx.model('topic');

  let result = await Topic.getTopicForPage(query, null, {
      sort: '-create_time'
    },current_page, config.pageSize, config.showPageNum);


  await ctx.render('user/topics', {
    title: `${username} 发表的话题`,
    topics: result.data,
    user: user,
    page: result.page
  })
})


module.exports = router;

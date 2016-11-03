const router = require('koa-router')();
const config = require('../config');
/**
 * 用户设置
 */
router.get('/setting', checkLogin, async (ctx, next) => {
  let User = ctx.model('user');
  let user = await User.findOneQ({
    username: ctx.state.username
  });
  await ctx.render('user/setting', {
    title: '用户中心',
    user: user
  });
});

/**
 * 修改用户信息
 */
router.post('/', checkLogin, async (ctx, next) => {
  let body = ctx.request.body;

  let User = ctx.model('user');

  let user = await User.findOneQ({
    username: ctx.state.username
  });

  user.email = body.email;
  user.home = body.home;
  user.github = body.github;
  user.signature = body.signature;

  let result = await user.saveQ();
  
  if(result) {
    ctx.session.user = user;
    return ctx.success();
  } else {
    return ctx.error('请求失败');
  }
});
/**
 * 修改密码
 */
router.post('/setpass', checkLogin, async (ctx, next) => {
  let oldpass = ctx.request.body.oldpass;
  let newpass = ctx.request.body.newpass;

  if(!oldpass || !newpass) {
    return ctx.error('请求参数不完整！');
  }

  let User = ctx.model('user');

  let user = await User.check_password(ctx.state.username, oldpass);


  if(!user) {
    return ctx.error('当前密码输入错误，请检查后重试！');
  }

  user.password = newpass;
  let result = await user.saveQ();

  if(!result) {
    return ctx.error('保存失败，请检查后重试！');
  }
  // 重新登录
  ctx.session.username = null;
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
  let body = ctx.request.body;
  
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
  let body = ctx.request.body;
  let User = ctx.model('user');
  let user = await User.check_password(body.username, body.password);
  
  if(!user) {
    return ctx.error('没有此用户或密码错误！');
  }
  // 用户名密码正确
  ctx.session.username = user.username;
  ctx.session.user = user.toObject();
  // 判断是否是管理员帐号
  if(config.admins.indexOf(user.username) != -1) {
    ctx.session.user.isAdmin = true;
  }
  return ctx.success();
});

router.get('/logout', (ctx, next) => {
  ctx.session.username = null;
  ctx.session.user = null;
  ctx.redirect('/');
})

async function checkLogin (ctx, next) {
  if(!ctx.state.username) {
    return ctx.error("您还未登录，请登录后重试！");
  } else {
    await next();
  }
} 


module.exports = router;

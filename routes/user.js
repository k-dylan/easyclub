var router = require('koa-router')();
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
    return ctx.body = {
      status: 1,
      message: '参数有误!'
    };
  
  let User = ctx.model('user');
  // 验证用户名是否重复
  let user = await User.findOneQ({
    username: body.username
  });
  
  if(user) {
    return ctx.body = {
      status: 1,
      message: '用户已注册过啦！'
    };
  }; 
  // 验证邮箱
  user = await User.findOneQ({
    email: body.email
  });
  
  if(user) {
    return ctx.body = {
      status: 1,
      message: '此邮箱已经注册过啦！'
    };
  }; 
  
  user = new User(body);
  let result = await user.saveQ();
  return ctx.body = {
    status: 0
  }
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
  let user = await User.checkPassword(body.username, body.password);
  
  if(!user) {
    return ctx.body = {
      status: 1,
      message: '没有此用户或密码错误！'
    }
  }
  // 用户名密码正确
  ctx.session.username = user.username;
  
  return ctx.body = {
    status: 0
  }
});

router.get('/logout', (ctx, next) => {
  ctx.session.username = null;
  ctx.redirect('/');
})



module.exports = router;

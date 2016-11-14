
'use strict'
const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const views = require('koa-views');
const co = require('co');
const convert = require('koa-convert');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');
const loader = require('loader');
const mongoose = require('koa-mongoose');
const session = require('koa-session');

const config = require('./config');
const index = require('./routes/index');
const user = require('./routes/user');
const topic = require('./routes/topic');
const tools = require('./common/tools');

const VIEWSDIR = __dirname + '/views';

app.keys = ['easyclub'];

onerror(app);

// logger
app.use(convert(logger()));


// 本地调试状态
if(config.debug) {
  app.use(require('./middlewares/stylus')(__dirname + '/public'));
  const livereload = require('livereload');
  let server = livereload.createServer({
    exts: ['jade','styl'] 
  });
  server.watch([
    __dirname + '/public',
    VIEWSDIR
  ]);
};

// middlewares
app.use(convert(require('koa-static')(__dirname + '/public')));
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(convert(session(app)));

app.use(require('./middlewares/return_data'));

app.use(views(VIEWSDIR, {
  extension: 'jade'
}));

// 数据库
app.use(convert(mongoose(Object.assign({
  server: {
    poolSize: 5
  },
  schemas: __dirname + '/models'
}, config.mongodb))));


app.use(async (ctx, next) => {

  if(config.debug && ctx.cookies.get('dev-user')) {
    // 测试用户使用
    var testuser = JSON.parse(ctx.cookies.get('dev-user'));

    let user = await ctx.model('user').findOneQ({
      username: testuser.username
    });
    
    ctx.session.user = user;
    
    if(testuser.isAdmin) {
      ctx.session.user.isAdmin = true;
    }
  }
  // 处理时间函数 
  ctx.state.getTimeAgo = tools.getTimeAgo;
  ctx.state.loader = loader;
  ctx.state.sitename = config.sitename;

  if(ctx.session.user) {
    let user = ctx.state.current_user = ctx.session.user;
    // 判断是否是管理员帐号
    if(config.admins.indexOf(user.username) != -1) {
      user.isAdmin = true;
    }
  }
  
  await next();
});

app.use(require('./middlewares/jade_partial')(VIEWSDIR));

router.use('/', index.routes(), index.allowedMethods());
router.use('/user', user.routes(), user.allowedMethods());
router.use('/topic', topic.routes(), topic.allowedMethods());

app.use(router.routes(), router.allowedMethods());

// response
app.on('error', function(err, ctx){
  console.error(err);
  // console.error('server error', err, ctx);
});


module.exports = app;
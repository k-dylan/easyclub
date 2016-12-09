
'use strict'

const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const Pug = require('koa-pug');
const co = require('co');
const convert = require('koa-convert');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');
const mongoose = require('koa-mongoose');
const session = require('koa-session');
const UglifyJS = require('uglify-js')

const config = require('./config');
const index = require('./routes/index');
const user = require('./routes/user');
const topic = require('./routes/topic');
const reply = require('./routes/reply');
const tools = require('./common/tools');


const VIEWSDIR = __dirname + '/views';

let assets = {};
app.keys = ['easyclub'];

onerror(app);

// logger
app.use(convert(logger()));


// 本地调试状态
if(config.debug) {
  app.use(require('./middlewares/stylus')(__dirname));
  const livereload = require('livereload');
  let server = livereload.createServer({
    exts: ['jade','styl'] 
  });
  server.watch([
    __dirname + '/public',
    VIEWSDIR
  ]);
} else {
  try {
    assets = require('./assets.json');
  } catch (e) {
    console.error('请先执行 make build 生成assets.json文件')
    throw e;
  }
}

// middlewares
app.use(convert(require('koa-static2')("/public",__dirname + '/public')));
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(convert(session(app)));

app.use(require('./middlewares/return_data'));

const pug = new Pug({
  viewPath: VIEWSDIR,
  debug: config.debug,
  noCache: config.debug,
  helperPath: [
    {
      getTimeAgo : tools.getTimeAgo,
      Loader : require('loader')
    }
  ],
  app: app
});
// 压缩行内样式
pug.options.filters = {
  uglify: function (text, options) {
    if(config.debug){
      return text;
    } else {
      let result = UglifyJS.minify(text, {fromString: true});
      return result.code;
    }
  }
}

// 数据库
require('mongoose').Promise = global.Promise
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
  // 添加模板变量
  pug.locals = Object.assign(pug.locals, {
    sitename: config.sitename,
    assets: assets,
    isDebug: config.debug
  })


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
router.use('/reply', reply.routes(), topic.allowedMethods());
app.use(router.routes(), router.allowedMethods());

// response
app.on('error', function(err, ctx){
  console.error(err);
  // console.error('server error', err, ctx);
});


module.exports = app;
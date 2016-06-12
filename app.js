
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

app.keys = ['easyclub'];

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
    __dirname + '/views'
  ]);
};

// middlewares
app.use(convert(require('koa-static')(__dirname + '/public')));
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(convert(session(app)));


app.use(async (ctx, next) => {
  ctx.state = {   
    loader: loader,   
    sitename: config.sitename,
    // 用户登录状态
    username: ctx.session.username || false,
    username_id: ctx.session.username_id
  };
  await next();
})

app.use(views(__dirname + '/views', {
  extension: 'jade'
}));

// 数据库
app.use(convert(mongoose(Object.assign({
  server: {
    poolSize: 5
  },
  schemas: __dirname + '/models'
}, config.mongodb))));

router.use('/', index.routes(), index.allowedMethods());
router.use('/user', user.routes(), user.allowedMethods());
router.use('/topic', topic.routes(), topic.allowedMethods());

app.use(router.routes(), router.allowedMethods());

// response
app.on('error', function(err, ctx){
  console.log(err)
  logger.error('server error', err, ctx);
});


module.exports = app;
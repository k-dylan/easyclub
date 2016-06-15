const router = require('koa-router')();
const config = require('../config');
const Promise = require('promise');

router.get('/', async function (ctx, next) {
  
  let current_tag = ctx.query.tag ;
  
  // 读取主题列表
  let Topic = ctx.model('topic');
  
  
  let query = {deleted: false};
  
  if(current_tag)
    query.tag = current_tag;

  let topics = await Topic.find(query).sort('create_time').skip(0).limit(10).execQ();
  
  //  读取用户信息
  let User = ctx.model("user");
  
  topics = await Promise.all(topics.map( async (topic) => {
    topic.author = await User.findOneQ({
      _id: topic.author_id
    });
    return topic;
  }));

  
  await ctx.render('index', {
    title: '首页',
    topics: topics,
    tags: config.tags,
    current_tag: current_tag
  }); 
})
module.exports = router;

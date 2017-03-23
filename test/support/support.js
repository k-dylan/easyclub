
const model = require('../../common/model');
const supertest = require('supertest');
const app = require('../../app');
const config = require('../../config');
const should = require('should');

const Topic = model('topic');
const User = model('user');
const Reply = model('reply');

var request = exports.request = supertest.agent(app.listen(3000));

/**
 * 发送ajax请求
 * - method {String} 请求类型
 * - url {String} 请求网址
 */
request.ajax = function (method, url) {
  return this[method](url).set('x-requested-with', 'XMLHttpRequest');
}

// 创建一个密码
var createPass = exports.createPass = () => {
  return 'pass' + (+ new Date()) % 100000;
}

var createUser = exports.createUser = () => {
  let key = +new Date();

  return {
    username: 'test' + key,
    password: createPass(),
    email: 'test'+ key +'@test.com'
  }
}



/**
 * 获取用户cookie
 * @param {Object} user 用户对象
 * @param {Boolean} isAdmin 是否是管理员
 * @returns
 */
var getUserCookie = exports.getUserCookie = (user, isAdmin) => {
  let obj = { username: user.username };
  if(isAdmin) obj.isAdmin = true;
  return 'dev-user=' + JSON.stringify(obj) + ';';
}
/**
 * 创建一个topic对象
 */
var createTopic = exports.createTopic = () => {
  let key = +new Date();
  return {
    title: '测试主题' + key,
    content: '这里是内容' + key,
    tag: config.tags[0]
  }
}


/**
 * 返回错误信息验证
 */
var shouldError = exports.shouldError = (msg, done) => {
  return (err, res) => {
    should.not.exist(err);
    res.body.status.should.equal(1);
    res.body.message.should.equal(msg);
    done();
  }
}


/**
 * 创建并保存一个topic对象
 */
var createAndsaveTopic = exports.createAndSaveTopic = async (user) => {
  let topic = new Topic(createTopic());
  topic.author_id = user._id;
  // 更新用户主题数量
  await User.updateTopicCount(user._id, 1);
  
  return await topic.save();
}

var createAndSaveUser = exports.createAndSaveUser = async () => {
  let user = new User(createUser());
  return await user.save();
}

var removeUser = exports.removeUser = async (user) => {
  return await User.remove({ username: user.username });
}

var removeTopic = exports.removeTopic = async (topic) => {
  return await Topic.remove({title: topic.title});
}

var removeReply = exports.removeReply = async (reply) => {
  return await Reply.remove({_id: reply._id});
}


const User = require('../db').user;
const supertest = require('supertest');
const app = require('../../app');
const config = require('../../config');
const should = require('should');


exports.request = supertest.agent(app.listen(3000));


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

var createAndSaveUser = exports.createAndSaveUser = async () => {
  let user = new User(createUser());
  return await user.save();
}

var deleteUser = exports.deleteUser = async (user) => {
  return await User.remove({ username: user.username });
}

var getUserCookie = exports.getUserCookie = (user) => {
  return 'dev-user=' + user.username + ';';
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

var shouldError = exports.shouldError = (msg, done) => {
  return (err, res) => {
    should.not.exist(err);
    res.body.status.should.equal(1);
    res.body.message.should.equal(msg);
    done();
  }
}


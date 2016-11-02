/**
 * 首页测试模块
 */

const should = require('should');
const support = require('./support/support');

const request = support.request;
const shouldError = support.shouldError;

describe('Index', () => {
  let user = {};
  let userCookie = '';
  before(async () => {
    user = await support.createAndSaveUser();
    userCookie = support.getUserCookie(user);
  });

  after(async () => {
    await support.removeUser(user);
  });


  
  it('#show index page when no login', (done) => {
    request 
      .get('/')
      .set('Cookie', '')
      .expect(200, (err, res) => {
        should.not.exist(err);
        res.text.should.containEql('<a href="/user/login">登录</a>');
        done();
      })
  });

  it('#show index page when login', (done) => {
    request 
      .get('/')
      .set('Cookie', userCookie)
      .expect(200, (err, res) => {
        should.not.exist(err);
        res.text.should.containEql('欢迎你：' + user.username);
        done();
      })
  })
})


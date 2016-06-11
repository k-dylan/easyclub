/**
 * 用户模块测试用例
 */
const supertest = require('supertest');
const should = require('should');
const app = require('../app');
const User = require('./db/user');

var request = supertest.agent(app.listen(3000));

describe('test user', function () {
  var user = {
    username: 'test123',
    password: '123456',
    email: 'test@test.com'
  }
  
  it('should show user register',  (done) => {
    request
      .get('/user/register')
      .expect(200, (err, res) => {
        res.text.should.containEql('用户注册');
        done(err);
      })
  });
  
  it('register user', (done) => {
    request
      .post('/user/register')
      .send(user)
      .expect(200, (err, res) => {
        res.body.status.should.equal(0);
        done(err);
      })
  });
  
  it('should show user login',  (done) => {
    request
      .get('/user/login')
      .expect(200, (err, res) => {
        res.text.should.containEql('用户登录');
        done(err);
      })
  });
  
  it('login user', (done) => {
    request
      .post('/user/login')
      .send({
        username: user.username,
        password: user.password
      })
      .expect(200, (err,res) => {
        res.body.status.should.equal(0);
        done(err);
      });
  });
  
  it('verify login is success', (done) => {
    request
      .get('/')
      .expect(200, (err, res) => {
        res.text.should.containEql(user.username);
        done(err);
      })
  });
  
  it('delete the user', (done) => {
    User.del(user.username, (err, data) => {
      data.result.ok.should.equal(1);
      done(err);
    });
  });
})
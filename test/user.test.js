/**
 * 用户模块测试用例
 */
const should = require('should');
const support = require('./support/support');


const request = support.request;
const shouldError = support.shouldError;


describe('User', () => {

  var user = support.createUser();

  describe('register and login test user', () => {

    it('#register page', (done) => {
      request
        .get('/user/register')
        .set('Cookie', '')
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql('用户注册');
          done();
        })
    });

    it('#should error when no username or password or email', (done) => {
      request
        .ajax('post','/user/register')
        .send({
          username: user.username,
          password: user.password,
          email: ''
        })
        .expect(200, shouldError('您请求的参数不完整!', done));
    })

    it('#register', (done) => {
      request
        .ajax('post', '/user/register')
        .send(user)
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.body.status.should.equal(0);
          done();
        })
    });

    it('#repeat register', (done) => {
      request
        .ajax('post','/user/register')
        .send(user)
        .expect(200, shouldError('用户名已注册过啦！', done))
    })

    it('#repeat email', (done) => {
      request
        .ajax('post','/user/register')
        .send({
          username: 'testawelsdasdfv',
          password: '123123123',
          email: user.email
        })
        .expect(200, shouldError('此邮箱已经注册过啦！', done))
    })

    it('#login page', (done) => {
      request
        .get('/user/login')
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql('用户登录');
          done();
        });
    });

    it('#should error when wrong passord', (done) => {
      request
        .ajax('post','/user/login')
        .send({
          username: user.username,
          password: '123123'
        })
        .expect(200, shouldError('没有此用户或密码错误！', done))
    })

    it('#login', login(user));

    it('#verify login', verify(user));

  });

  describe('show admin login', () => {
    it('#check', (done) => {
      request
        .get('/')
        .set('Cookie', support.getUserCookie(user, true))
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql('(管理员)');
          done();
        })
    })
  })

  describe('show error when not login', () => {
    it('#request', async (done) => {

      let arr = [
        verifyNotLogin('get', '/user/setting'),
        verifyNotLogin('post', '/user'),
        verifyNotLogin('post', '/user/setpass')
      ]
      await Promise.all(arr);
      
      done();
    })
  })


  describe('setting user', () => {
    it('#setting page', (done) => {
      console.log('-------');
      request
        .get('/user/setting')
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql(user.email);
          done();
        })
    })

    it('#setting signature', (done) => {
      user.signature = '个性签名,gexingqianming!';
      request
        .ajax('post','/user')
        .send(user)
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.body.status.should.equal(0);
          done();
        });
    })

    it('#verify signature', (done) => {
      request
        .get('/user/setting')
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql(user.signature);
          done();
        })
    })
  })

  describe('setting user passord', () => {

    it('#show error when no oldpass or no newpass', (done) => {
      request
        .ajax('post','/user/setpass')
        .send({
          oldpass: '',
          newpass: '121asdf'
        })
        .expect(200, shouldError('请求参数不完整！', done))
    })

    it('#show error when the error oldpass', (done) => {
      request
        .ajax('post','/user/setpass')
        .send({
          oldpass: '123123',
          newpass: '121asdf'
        })
        .expect(200, shouldError('当前密码输入错误，请检查后重试！', done))
    });


    it('#setting password', (done) => {
      let newPass = support.createPass();
      request
        .ajax('post','/user/setpass')
        .send({
          oldpass: user.password,
          newpass: newPass
        })
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.body.status.should.equal(0);
          user.password = newPass;
          done();
        });
    })

    it('#login for new password', login(user));

    it('#verify login', verify(user));

  })

  describe('delete test user', () => {
    it('#delete the user', async (done) => {
      let data = await support.removeUser(user);
      data.result.ok.should.equal(1);
      done();
    });
  });
});

function login(user) {
  return (done) => {
    request
      .ajax('post','/user/login')
      .send({
        username: user.username,
        password: user.password
      })
      .expect(200, (err, res) => {
        should.not.exist(err);
        res.body.status.should.equal(0);
        done();
      });
  }
}

function verify(user) {
  return (done) => {
    request
      .get('/')
      .expect(200, (err, res) => {
        should.not.exist(err);
        res.text.should.containEql(user.username);
        done();
      })
  }
}

function verifyNotLogin (method, url) {
  return new Promise((resolve, reject) => {
    request.ajax(method, url)
      .set('Cookie','')
      .expect(200, (err, res) => {
        if(err) reject(err);

        res.body.status.should.equal(1);
        res.body.message.should.equal('您还未登录，请登录后重试！');

        resolve();
      })
  });
}

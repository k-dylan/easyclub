/**
 * 回复模块测试用例
 */
const should = require('should');
const support = require('./support/support');
const config = require('../config');

const request = support.request;
const shouldError = support.shouldError;

describe('Reply ', () => {
  let replyUser = {};
  let authorUser = {};
  let replyCookie = '';
  let reply = {
    content: '这里是回复内容' + (+ new Date())
  };
  let topic = {};

  before(async () => {
    authorUser = await support.createAndSaveUser();
    replyUser = await support.createAndSaveUser();
    topic = await support.createAndSaveTopic(authorUser);
    replyCookie = support.getUserCookie(replyUser);
  })

  after(async () => {
    await Promise.all([
      support.removeUser(authorUser),
      support.removeUser(replyUser),
      support.removeTopic(topic),
      support.removeReply(reply)
    ])
  })

  describe('Create reply', () => {

    it('#show error for no login', (done) => {
      request
        .post('/topic/' + topic._id + '/reply')
        .set('Cookie', '')
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql('错误');
          res.text.should.containEql('您还未登录，请登录后重试！');
          done();
        });
    });

    it('#show error for wrong topic_id', (done) => {
      request 
        .ajax('post','/topic/asdfasdfasf/reply')
        .set('Cookie', replyCookie)
        .expect(200, shouldError('您请求的参数有误，请检查后重试！', done));
    });

    it('#show error for no content', (done) => {
      request
        .ajax('post','/topic/' + topic._id + '/reply')
        .set('Cookie', replyCookie)
        .expect(200, shouldError('您请求的参数有误，请检查后重试！', done));
    });

    it('#reply the topic', (done) => {
      request
        .ajax('post', '/topic/' + topic._id + '/reply')
        .set('Cookie', replyCookie)
        .send(reply)
        .expect(302, (err, res) => {
          should.not.exist(err);
          // 正则匹配获取replyid
          let match = res.text.match(/\#(.*?)\"\>/);
          reply._id = match[1];
          done();
        });
    });

    it('#show the reply', (done) => {
      request
        .get('/topic/' + topic._id)
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql(reply.content);
          res.text.should.containEql(replyUser.username);
          done();
        })
    });
  });

  describe('Check the user score', () => {
    it('#should the score is right', (done) => {
      request
        .get('/')
        .set('Cookie', replyCookie)
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql('积分：' + config.score.reply);
          done();
        })
    })
  })

  describe('edit the reply', () => {
    it('#show error when not author', done => {
      request
        .get(`/reply/${reply._id}/edit`)
        .set('Cookie', support.getUserCookie(authorUser))
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql('您没有权限执行此操作！');
          done();
        })
    })
    it('#show error when not login', done => {
      request
        .get(`/reply/${reply._id}/edit`)
        .set('Cookie', '')
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql('您还未登录，请登录后重试！');
          done();
        })
    })

    it('#show edit page', done => {
      request
        .get(`/reply/${reply._id}/edit`)
        .set('Cookie', replyCookie)
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql(reply.content);
          done();
        })
    })

    it('#show error when not exist content', done => {
      request
        .ajax('post',`/reply/${reply._id}/edit`)
        .set('Cookie', replyCookie)
        .send({
          content: ''
        })
        .expect(200, shouldError('您请求的参数有误，请检查后重试！', done))
    })

    it('#edit the reply', done => {
      request
        .ajax('post',`/reply/${reply._id}/edit`)
        .set('Cookie', replyCookie)
        .send({
          content: '这是修改后的内容'
        })
        .expect(302, (err, res) => {
          should.not.exist(err);
          reply.content = '这是修改后的内容';
          done();
        })
    })

    it('#show the reply', (done) => {
      request
        .get('/topic/' + topic._id)
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql(reply.content);
          res.text.should.containEql(replyUser.username);
          done();
        })
    });
  })

  describe('delete the reply', () => {
    it('#show error when not author', done => {
      request
        .ajax('get',`/reply/${reply._id}/delete`)
        .set('Cookie', support.getUserCookie(authorUser))
        .expect(200, shouldError('您没有权限执行此操作！', done));
    });

    it('#delete the reply', done => {
      request
        .ajax('get',`/reply/${reply._id}/delete`)
        .set('Cookie', replyCookie)
        .expect(200, (err,res) => {
          should.not.exist(err);
          res.body.status.should.equal(0);
          res.body.message.should.equal('删除成功！');
          done();
        });
    })
  })

})
/**
 * 回复模块测试用例
 */
const should = require('should');
const support = require('./support/support');

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
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.body.status.should.equal(0);
          // topic._id 是ObjectId对象
          res.body.topic_id.should.equal(topic._id.toString());
          should.exist(res.body.reply_id);
          reply._id = res.body.reply_id;
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

  })


  describe('Check the user data', () => {
    it('#should the reply_count is right', (done) => {
      request
        .get('/')
        .set('Cookie', replyCookie)
        .expect(200, (err, res) => {
          should.not.exist(err);
          res.text.should.containEql('<a href="/user/'+ replyUser.username +'/reply">1</a>')
          done();
        })
    })
  })


})
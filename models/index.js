
const mongoose =  require('mongoose-q')(require('mongoose'));
const UserSchema = require('./user');
const TopicSchema = require('./topic');
const ReplySchema = require('./reply');
const MessageSchema = require('./message');

const config = require('../config');
// 数据库
require('mongoose').Promise = global.Promise

let mongodb = `mongodb://${config.mongodb.host}/${config.mongodb.database}`
if(config.mongodb.user)
  mongodb = `mongodb://${config.mongodb.user}:${config.mongodb.pass}@${config.mongodb.host}/${config.mongodb.database}`
mongoose.connect(mongodb, { // MongoClient.connect(url, options, callback)
    useMongoClient: true,
    poolSize: 10
  }, (err) => {
    if(err) {
      console.error(err);
    }
  });

mongoose.model('user', UserSchema);
mongoose.model('topic', TopicSchema);
mongoose.model('reply', ReplySchema);
mongoose.model('message', MessageSchema);



module.exports = function (name) {
  name = name.toLowerCase();
  return mongoose.model(name);
}

const mongoose =  require('mongoose-q')(require('mongoose'));
const UserSchema = require('../models/user');
const TopicSchema = require('../models/topic');
const ReplySchema = require('../models/reply');
const config = require('../config');
// 数据库
require('mongoose').Promise = global.Promise

let mongodb = `mongodb://${config.mongodb.host}/${config.mongodb.database}`
if(config.mongodb.user)
  mongodb = `mongodb://${config.mongodb.user}:${config.mongodb.pass}@${config.mongodb.host}/${config.mongodb.database}`
mongoose.connect(mongodb, {
    server: {
      poolSize: 10
    }
  }, (err) => {
    if(err) {
      console.error(err);
    }
  });

mongoose.model('user', UserSchema);
mongoose.model('topic', TopicSchema);
mongoose.model('reply', ReplySchema);


// module.exports = {
//   user: mongoose.model('User'),
//   topic: mongoose.model('Topic'),
//   reply: mongoose.model('Reply')
// }
module.exports = function (name) {
  return mongoose.model(name);
}
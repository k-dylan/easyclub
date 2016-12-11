
const mongoose =  require('mongoose');
const UserSchema = require('../../models/user');
const TopicSchema = require('../../models/topic');
const ReplySchema = require('../../models/reply');
const config = require('../../config');

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

mongoose.model('User', UserSchema);
mongoose.model('Topic', TopicSchema);
mongoose.model('Reply', ReplySchema);


module.exports = {
  user: mongoose.model('User'),
  topic: mongoose.model('Topic'),
  reply: mongoose.model('Reply')
}

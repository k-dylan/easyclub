
const mongoose =  require('mongoose');
const UserSchema = require('../../models/user');
const TopicSchema = require('../../models/topic');
const config = require('../../config');


let mongodb = `mongodb://${config.mongodb.host}/${config.mongodb.database}`
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


module.exports = {
  user: mongoose.model('User'),
  topic: mongoose.model('Topic')
}

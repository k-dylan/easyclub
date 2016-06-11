
const mongoose =  require('mongoose');
const UserSchema = require('../../models/user');
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

const User = mongoose.model('User');

/**
 * 删除指定用户
 * - username String 要删除的用户名
 */
exports.del = function (username, callback) {
  User.remove({username: username}, callback);
}



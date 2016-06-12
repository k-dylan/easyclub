/**
 * 用户模型
 */
const mongoose = require('mongoose');
const crypto = require('crypto');

var UserSchema = new mongoose.Schema({
  username: { type: String, required: true},
  password: { type: String, required: true},
  email: { type: String, required: true },
  avatar: { type: String },
  topic_count: { type: Number, default: 0 },
  reply_count: { type: Number, default: 0 },
  create_time: { type: Date, default: Date.now }
});

UserSchema.index({username: 1}, {unique: true});

/**
 * password写入时加密
 */
UserSchema.path('password').set(function (v) {
  return crypto.createHash('md5').update(v).digest('base64');
});

/**
 * 验证用户名密码是否正确
 */
UserSchema.statics.check_password = async function (username, password) {
  let user = await this.findOneQ({
    username: username,
    password: crypto.createHash('md5').update(password).digest('base64')
  });
  return user;
}


/**
 * 增加减少用户文章数量
 */
UserSchema.statics.update_topic_count = async function (user_id, num) {
  let result = await this.update({_id: user_id}, {'$inc': {
    'topic_count': num
  }});
  return result;
}




module.exports = UserSchema;
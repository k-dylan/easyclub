/**
 * 用户模型
 */
const mongoose = require('mongoose');
const crypto = require('crypto');

var UserSchema = new mongoose.Schema({
  username: { type: String, required: true},  
  password: { type: String, required: true},
  email: { type: String, required: true },
  home: {type: String},   // 个人主页
  github: {type: String},  // github
  avatar: { type: String },  // 头像
  signature: {type: String, default: "无个性，不签名！"}, // 个性签名
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
UserSchema.statics.updateTopicCount = async function (userId, num) {
  let user = await this.findOneQ({_id: userId});
  user.topic_count += num;
  user.save();
  return user;
}

/**
 * 增加减少用户回复数量
 */
UserSchema.statics.updateReplyCount = async function (userId, num) {
  let user = await this.findOneQ({_id: userId});
  user.reply_count += num;
  user.save();
  return user;
}




module.exports = UserSchema;
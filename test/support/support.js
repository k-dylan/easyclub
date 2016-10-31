
const User = require('../db').user;

// 创建一个密码
var createPass = exports.createPass = () => {
  return 'pass' + (+ new Date()) % 100000;
}

var createUser = exports.createUser = () => {
  let key = +new Date();

  return {
    username: 'test' + key,
    password: createPass(),
    email: 'test'+ key +'@test.com'
  }
}

var createAndSaveUser = exports.createAndSaveUser = async () => {
  let user = new User(createUser());
  return await user.save();
}

var deleteUser = exports.deleteUser = async (user) => {
  return await User.remove({ username: user.username });
}

var getUserCookie = exports.getUserCookie = (user) => {
  return 'dev-user=' + user.username + ';';
}


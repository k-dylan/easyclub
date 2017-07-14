/**
 * at用户
 */

const models = require('../models');

/**
 * 提取出@的用户名
 */
let fetchUsers = exports.fetchUsers = function (content) {
  let result = content.match(/@[a-z0-9\-_]+\b/igm);
  if(result) {
    let names = [];
    for(let i = 0, l = result.length; i < l; i++) {
      // 删除配置的 @ 符号
      let name = result[i].slice(1);
      if(names.indexOf(name) === -1) {
        names.push(result[i].slice(1));
      }
    }
    return names;
  }
  return [];
}

/**
 * 根据内容分析出 @ 到的用户,并发送消息
 * 
 * @param {any} content 
 * @param {any} topicId 
 * @param {any} authorId 
 * @param {any} replyId 
 */
exports.sendMessageToUser = async function (content, topicId, authorId, replyId) {
  let users = fetchUsers(content);
  let User = models('user');
  let Message = models('message');
  await Promise.all(users.map(async (username) => {
    let user = await User.findOneQ({ username: username }); 
    if(user) {
      // 发送 at 消息
      await Message.createQ({
        type: 'at',
        author_id: authorId,
        master_id: user._id,
        topic_id: topicId,
        reply_id: replyId,
        content: '@了你',
      });
    }
  }))
}
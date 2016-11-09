/**
 * 主题模型
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const validator = require('validator');
const page = require('../common/page');
const config = require('../config');

var TopicSchema = new Schema({
  title: { type: String, required: true},
  content: { type: String, required: true},
  author_id: { type: ObjectId, required: true },
  reply_count: { type: Number, default: 0},
  visit_count: { type: Number, default: 0},
  last_reply: { type: ObjectId},
  last_reply_at: {type: Date, default: Date.now},
  tag: {type: String},
  create_time: { type: Date, default: Date.now },
  update_time: { type: Date, default: Date.now },
  deleted: {type: Boolean, default: false}
});

TopicSchema.index({create_time: -1});
TopicSchema.index({author_id: 1, create_time: -1});

/**
 * 回复主题
 */
TopicSchema.statics.reply = async function (topic_id, reply_id) {

  if(!validator.isMongoId(topic_id + '') || !validator.isMongoId(reply_id + '')) 
    return false;

  let result = await this.updateQ({
    _id: topic_id
  }, {
    '$inc': {'reply_count': 1},
    '$set': {
      last_reply: reply_id,
      last_reply_at: Date.now()
    }
  });
  return result;
}

/**
 * 获取主题信息
 * 并更新浏览数
 */
TopicSchema.statics.get_topic = async function (topic_id) {
  if(!validator.isMongoId(topic_id + '')) 
    return false;
  let result = await this.findByIdAndUpdateQ(topic_id, {
    '$inc': {'visit_count': 1}
  });
  return result;
}

/**
 * 根据分页获取主题
 * Callback
 * - data {Array} 查询结果
 * - page {Object} 分页信息 开始页码、结束页码
 * @param {Object} query 查询匹配对象
 * @param {String} field 要查询的字段，为null时返回所有字段
 * @param {String} options 其它属性， sort skin limit 等
 * @param {any} current_page 要查询的页码
 * @param {any} pageSize 每页显示的数据条数
 * @param {any} showPageNum 需要在页面上显示的页码数量
 * @returns
 */
page.addFindPageForQuery(TopicSchema, 'getTopicForPage');
// TopicSchema.statics.getTopicForPage = async function (query, field, options, current_page, pageSize, showPageNum) {
//   pageSize = pageSize || config.pageSize;
//   showPageNum = showPageNum || config.showPageNum;

//   let start_item_num = (current_page - 1) * pageSize;
//   // 查询总条数
//   let count = await this.countQ(query); 
//   let all_page_num = Math.ceil(count / pageSize);
  
//   let pages = page.get(current_page, all_page_num, showPageNum);

//   options = Object.assign(options, {
//       skip: start_item_num,
//       limit: pageSize
//     });
  
//   let data =  await this.find(query, field, options);
//   return {
//     data: data,
//     page: pages
//   }
// }

module.exports = TopicSchema;
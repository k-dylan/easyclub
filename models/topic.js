/**
 * 主题模型
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


var TopicSchema = new Schema({
  title: { type: String, required: true},
  content: { type: String, required: true},
  author_id: { type: ObjectId, required: true },
  reply_count: { type: Number, default: 0},
  visit_count: { type: Number, default: 0},
  last_reply: { type: ObjectId},
  last_reply_at: {type: Date, default: Date.now},
  tab: {type: String},
  create_time: { type: Date, default: Date.now },
  deleted: {type: Boolean, default: false}
});

TopicSchema.index({create_time: -1});
TopicSchema.index({author_id: 1, create_time: -1});

module.exports = TopicSchema;
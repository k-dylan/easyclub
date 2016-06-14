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
  tag: {type: String},
  create_time: { type: Date, default: Date.now },
  update_time: { type: Date, default: Date.now },
  deleted: {type: Boolean, default: false}
});

TopicSchema.index({create_time: -1});
TopicSchema.index({author_id: 1, create_time: -1});


TopicSchema.statics.reply = async function (topic_id,reply_id) {
  console.log(reply_id)
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

TopicSchema.statics.get_topic = async function (topic_id) {
  
}

module.exports = TopicSchema;
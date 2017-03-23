
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var MessageSchema = new Schema({
  type: { type: String, required: true },
  author_id: { type: ObjectId, required: true },
  master_id: { type: ObjectId, required: true },
  topic_id: { type:ObjectId},
  reply_id: { type: ObjectId },
  create_time: { type: Date, default: Date.now },
  content: { type: String, required: true },
  is_read: { type: Boolean, default: false }
});

MessageSchema.index({create_time: -1});
MessageSchema.index({topic_id: 1, create_time: -1});


module.exports = MessageSchema;
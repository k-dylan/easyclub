
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var ReplySchema = new Schema({
  topic_id: { type: ObjectId, required: true },
  author_id: { type: ObjectId, required: true },
  create_time: { type: Date, default: Date.now },
  update_time: { type: Date, default: Date.now },
  content: { type: String, required: true },
  deleted: { type: Boolean, default: false }
});

ReplySchema.index({create_time: -1});
ReplySchema.index({topic_id: 1, create_time: -1});

module.exports = ReplySchema;
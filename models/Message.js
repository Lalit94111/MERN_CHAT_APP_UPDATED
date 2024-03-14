const mongoose = require('mongoose');
const User = require('./User')

const MessageSchema = new mongoose.Schema({
  content: String,
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  time: String,
  date: String,
  to: String
})

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const kasTransactionScheme = new mongoose.Schema({
  userId: [{
    type: ObjectId,
    ref: 'User'
  }],
  userName: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['IN', 'OUT'],
    default: 'NEW'
  }
});

module.exports = mongoose.model('KasTransaction', kasTransactionScheme);

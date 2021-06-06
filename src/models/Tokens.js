const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const tokenScheme = new mongoose.Schema({
  token: {
    type: String
  },
  userId: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
})

module.exports = mongoose.model('Tokens', tokenScheme);

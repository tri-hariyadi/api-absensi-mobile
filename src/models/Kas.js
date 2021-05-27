const mongoose = require('mongoose');

const kasScheme = new mongoose.Schema({
  saldo: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: new Date()
  }
});

module.exports = mongoose.model('Kas', kasScheme);

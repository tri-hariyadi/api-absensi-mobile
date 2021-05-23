const mongoose = require('mongoose');

const kasScheme = new mongoose.Schema({
  saldo: {
    type: Number,
    required: true
  },
  time: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Kas', kasScheme);

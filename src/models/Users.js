const mongose = require('mongoose');

const userScheme = new mongose.Schema({
  username: {
    type: String,
    required: true,
    maxlength: 200
  },
  email: {
    type: String,
    required: true,
    maxlength: 200,
    trim: [true, 'Your email is exist.'],
    unique: 1
  },
  phonenumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  organisation: {
    type: String,
    required: true,
    maxlength: 100
  },
  divisi: {
    type: String,
    required: true,
    maxlength: 100
  },
  class: {
    type: String,
    required: true,
    maxlength: 50
  },
  nim: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: false
  },
  birthPlace: {
    type: String,
    required: false,
    maxlength: 100
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  image: {
    type: String,
  }
});

module.exports = mongose.model('User', userScheme);

const mongose = require('mongoose');

const phoneValidators = [
  { validator: function (v) { return v.length >= 10 }, msg: 'Phone Number must not be less than 10 digits' },
  { validator: function (v) { return v.length <= 15 }, msg: 'Phone Number must not exceed 15 digits' },
  { validator: function (v) { return /^[0-9]+$/.test(v) }, msg: 'Phone Number is invalid' }
]

const userScheme = new mongose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    maxlength: 200
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    maxlength: 200,
    trim: true,
    unique: [1, 'Email is already in use, please use another email for registration.'],
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Invalid email address, please fill a valid email address'
    }
  },
  phonenumber: {
    type: String,
    required: [true, 'Phone Number is required'],
    validate: phoneValidators
  },
  password: {
    type: String,
    // required: [true, 'Password is required'],
    // minlength: [8, 'Password minimum 8 characters'],
  },
  organisation: {
    type: String,
    required: [true, 'Organisation is required'],
    maxlength: 100
  },
  divisi: {
    type: String,
    required: [true, 'Divisi is required'],
    maxlength: 100
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    maxlength: 50
  },
  nim: {
    type: String,
    required: [true, 'NIM is required'],
    validate: {
      validator: function (v) {
        return /^[0-9]+$/.test(v);
      },
      message: 'NIM is invalid'
    }
  },
  birthDate: {
    type: Date,
    required: [false, 'Birth Date is required']
  },
  birthPlace: {
    type: String,
    required: [false, 'Birth Place is required'],
    maxlength: 100
  },
  gender: {
    type: String,
    enum: {
      values: ['male', 'female'],
      message: `Only male and female is supported for gender field.`
    },
    required: [true, 'Gender is required']
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    enum: {
      values: ['0', '1'],
      message: 'Only 0 and 1 is supported for role field.'
    },
    required: [true, 'Role is required'],
    default: '0'
  }
});

module.exports = mongose.model('User', userScheme);

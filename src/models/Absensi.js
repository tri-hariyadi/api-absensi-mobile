const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const date = new Date()
const defaultDateWork =
  `${date.getFullYear()}-${String((date.getMonth() + 1)).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const absensiScheme = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  userName: {
    type: String,
    required: [true, 'Username is required']
  },
  desc: {
    type: String,
    required: [true, 'Must include a description work'],
    default: this.desc
  },
  dateWork: {
    type: Date,
    required: [true, 'Date work is required'],
    // default: defaultDateWork
  },
  imageIn: {
    type: String,
  },
  imageOut: {
    type: String,
  },
  location: {
    type: String,
    required: [true, 'Location work is required']
  },
  // 1 => IN; 2 => OUT; 3 => izin
  status: {
    type: String,
    enum: {
      values: ['1', '2', '3'],
      message: 'Only 1, 2 and 3 is supported for role field.'
    },
    requred: [true, 'Status is required'],
    default: '1'
  }
}, {
  timestamps: {
    currentTime: () => {
      var current = new Date();
      const timeStamp = new Date(Date.UTC(current.getFullYear(),
        current.getMonth(), current.getDate(), current.getHours(),
        current.getMinutes(), current.getSeconds(), current.getMilliseconds()));
      return timeStamp;
    },
    createdAt: 'timeIn',
    updatedAt: 'timeOut'
  },
});

module.exports = mongoose.model('Absensi', absensiScheme);

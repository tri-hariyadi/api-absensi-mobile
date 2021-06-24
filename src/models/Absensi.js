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
    default: defaultDateWork
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
  // 1 => IN; 2 => OUT
  status: {
    type: String,
    enum: {
      values: ['1', '2'],
      message: 'Only 1 and 2 is supported for role field.'
    },
    requred: [true, 'Status is required'],
    default: '1'
  }
}, {
  timestamps: { createdAt: 'timeIn', updatedAt: 'timeOut' },
});

module.exports = mongoose.model('Absensi', absensiScheme);

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const absensiScheme = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User'
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
    default: new Date()
  },
  imageIn: {
    type: String,
  },
  imageOut: {
    type: String,
  },
}, {
  timestamps: { createdAt: 'timeIn', updatedAt: 'timeOut' },
});

module.exports = mongoose.model('Absensi', absensiScheme);

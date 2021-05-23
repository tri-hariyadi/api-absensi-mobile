const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const absensiScheme = new mongoose.Schema({
  userId: [{
    type: ObjectId,
    ref: 'User'
  }],
  userName: {
    type: String,
    required: true
  },
  // timeIn: {
  //   type: Date,
  //   required: true
  // },
  // timeOut: {
  //   type: Timestamp,
  //   required: true
  // },
  desc: {
    type: String,
    required: true
  },
  dateWork: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    required: true
  },
}, {
  timestamps: { createdAt: 'timeIn', updatedAt: 'timeOut' },
});

module.exports = mongoose.model('Absensi', absensiScheme);

const mongoose = require('mongoose');

const attendanceTagScheme = new mongoose.Schema({
  desc: {
    type: String,
    required: [true, 'Description is required'],
  }
});

module.exports = mongoose.model('AttendanceTag', attendanceTagScheme)

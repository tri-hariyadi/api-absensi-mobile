const AttendanceTag = require('../models/AttendanceTag');
const handleValidationError = require('../config/handleValidationError');
const responseWrapper = require('../config/responseWrapper');

module.exports = {
  addAttendanceTag: (req, res, next) => {
    const attendanceTag = new AttendanceTag({
      desc: req.body.desc
    });
    let error = attendanceTag.validateSync();
    if (error) handleValidationError(error, res);
    else attendanceTag.save((err, result) => {
      if (err) return res.status(500).send(responseWrapper(null, 'Internal server error', 500));
      res.status(200).send(responseWrapper({
        Message: 'Success add attendance tag'
      }, 'Success add attendance tag', 200));
    });
  },

  getAllAttendanceTag: (req, res, next) => {
    AttendanceTag.find().exec((err, result) => {
      if (err) return res.status(500).send(responseWrapper(null, 'Internal server error', 500));
      if (!result) return res.status(404).send(responseWrapper(null, 'Data not found', 404));
      res.status(200).send(responseWrapper(result, 'Success get data attendance tag', 200));
    });
  },

  getAttendanceTagById: (req, res, next) => {
    AttendanceTag.findOne({ _id: req.body.id }, (err, result) => {
      if (err) return res.status(500).send(responseWrapper(null, 'Internal server error', 500));
      if (!result) return res.status(404).send(responseWrapper(null, 'Data not found', 404));
      res.status(200).send(responseWrapper(result, 'Success get data attendance tag', 200));
    });
  },

  deleteAttendanceTag: (req, res, next) => {
    AttendanceTag.deleteOne({ _id: req.body.id }, (err) => {
      if (err) return res.status(500).send(responseWrapper(null, 'Internal server error', 500));
      res.status(200).send(responseWrapper({
        Message: 'Success delete attendance tag'
      }, 'Success delete attendance tag', 200));
    });
  }
}

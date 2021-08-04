const express = require('express');
const router = express.Router();
const verifyApiKey = require('../middlewares/verifyApiKey');

const attendanceTagController = require('../controllers/attendanceTagController');

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept, X-Api-Key"
  );
  next();
});

router.post('/attendacetag/add', verifyApiKey, attendanceTagController.addAttendanceTag);
router.get('/attendacetag/getAll', verifyApiKey, attendanceTagController.getAllAttendanceTag);
router.post('/attendacetag/getById', verifyApiKey, attendanceTagController.getAttendanceTagById);
router.post('/attendacetag/delete', verifyApiKey, attendanceTagController.deleteAttendanceTag);

module.exports = router;

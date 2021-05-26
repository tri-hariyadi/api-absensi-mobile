const express = require('express');
const router = express.Router();
const { authJwt } = require('../middlewares');
const { uploadSingle } = require('../middlewares/multer');
const verifyApiKey = require('../middlewares/verifyApiKey');

const absent = require('../controllers/absensiController');

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Headers", "X-Api-Key");
  next();
});

router.post('/absent/in', [uploadSingle, verifyApiKey, authJwt.verifyToken], absent.absenIn);
router.post('/absent/out', [uploadSingle, verifyApiKey, authJwt.verifyToken], absent.absentOut);
router.post('/absent/getAbsents', [verifyApiKey, authJwt.verifyToken], absent.getDataAbsents);

module.exports = router;

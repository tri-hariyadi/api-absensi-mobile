const express = require('express');
const router = express.Router();
const { authJwt } = require('../middlewares');
const verifyApiKey = require('../middlewares/verifyApiKey');

const absent = require('../controllers/absensiController');

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept, X-Api-Key"
  );
  next();
});

router.post('/absent/in', [verifyApiKey, authJwt.verifyToken], absent.absenIn);
router.post('/absent/out', [verifyApiKey, authJwt.verifyToken], absent.absentOut);
router.post('/absent/getAbsents', [verifyApiKey, authJwt.verifyToken], absent.getDataAbsents);
router.post('/absent/getAbsentById', [verifyApiKey, authJwt.verifyToken], absent.getDataAbsentById);
router.post('/absent/getLatestAbsents', [verifyApiKey], absent.getLatestDataAbsent);
router.post('/absent/absencepermission', [verifyApiKey, authJwt.verifyToken], absent.absencePermission);

module.exports = router;

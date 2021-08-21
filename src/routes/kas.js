const express = require('express');
const router = express.Router();
const { authJwt } = require('../middlewares');
const { uploadSingle } = require('../middlewares/multer');
const verifyApiKey = require('../middlewares/verifyApiKey');

const kas = require('../controllers/kasController');

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Headers", "X-Api-Key");
  next();
});

router.post('/kas/insertkas', [verifyApiKey, authJwt.verifyToken], kas.insertKas);
router.get('/kas/getKas', [verifyApiKey, authJwt.verifyToken], kas.getKas);
router.post('/kas/kasTransaction', [verifyApiKey, authJwt.verifyToken], kas.kasTransaction);
router.post('/kas/kasVerify', [verifyApiKey, authJwt.verifyToken], kas.updateKasTransaction);
router.post('/kas/getKasTransaction', [verifyApiKey, authJwt.verifyToken], kas.getKasTransaction);


module.exports = router;

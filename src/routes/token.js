const express = require('express');
const router = express.Router();
const verifyApiKey = require('../middlewares/verifyApiKey');

const tokenController = require('../controllers/tokenController');

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Headers", "X-Api-Key");
  next();
});

router.get('/refreshtoken', verifyApiKey, tokenController.refreshToken);

module.exports = router;

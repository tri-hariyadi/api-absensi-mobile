const express = require('express');
const router = express.Router();
const { verifySignUp, authJwt } = require('../middlewares');
const { uploadSingle } = require('../middlewares/multer');
const verifyApiKey = require('../middlewares/verifyApiKey');

const userManagement = require('../controllers/userManagementController');
const tokenController = require('../controllers/tokenController');

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Headers", "X-Api-Key");
  next();
});

router.post('/register', [verifySignUp.checkDuplicateUsernameOrEmail, verifyApiKey], userManagement.registerUser);
router.post('/login', verifyApiKey, userManagement.loginUser);
router.delete('/logout', verifyApiKey, tokenController.revokeToken);
router.post('/update', [uploadSingle, verifyApiKey], userManagement.updateUser);
router.post('/getAllUsers', [authJwt.verifyToken, verifyApiKey], userManagement.getAllUsers);

module.exports = router;

const express = require('express');
const router = express.Router();
const { verifySignUp } = require('../middlewares');
const { uploadSingle, uploadMultiple } = require('../middlewares/multer');

const userManagement = require('../controllers/userManagementController');

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

router.post('/register', [verifySignUp.checkDuplicateUsernameOrEmail], userManagement.registerUser);
router.post('/login', userManagement.loginUser);
router.post('/update', uploadSingle, userManagement.updateUser);

module.exports = router;

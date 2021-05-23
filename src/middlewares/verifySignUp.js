const Users = require('../models/Users');
const responseWrapper = require('../config/responseWrapper');

checkDuplicateUsernameOrEmail = (req, res, next) => {
  Users.findOne({
    email: req.body.email
  }).exec((err, user) => {
    if (err) return res.status(500).send(responseWrapper(null, err, 500));
    if (user) return res.status(400).send(responseWrapper(null, 'Failed! Email is already in use!', 400));
    next();
  });
}

const verifySignUp = {
  checkDuplicateUsernameOrEmail
}

module.exports = verifySignUp;

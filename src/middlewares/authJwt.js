const jwt = require('jsonwebtoken');
const config = require('../config/config').get(process.env.NODE_ENV);
const Tokens = require('../models/Tokens');

verifyToken = (req, res, next) => {
  let bearerHeader = req.headers['authorization'];

  if (!bearerHeader) return res.status(403).send({ message: "No token provided!" });

  const bearer = bearerHeader.split(' ');
  const bearerToken = bearer[1];

  Tokens.findOne({ token: bearerToken }, (err, result) => {
    // console.log(err);
    // console.log(req);
    // console.log(result);

    if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
    if (!result) return res.status(401).send({ message: "Invalid token!" });
    if (result) jwt.verify(bearerToken, config.SECRET, (err, decoded) => {
      console.log(err);
      if (err) return res.status(401).send({ message: "Unauthorized!" });
      req.token = bearerToken;
      console.log('req token => ', req.token);
      next();
    });
  });
};

const authJwt = {
  verifyToken
}

module.exports = authJwt;

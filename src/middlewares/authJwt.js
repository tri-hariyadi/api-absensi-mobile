const jwt = require('jsonwebtoken');
const config = require('../config/config').get(process.env.NODE_ENV);

verifyToken = (req, res, next) => {
  let bearerHeader = req.headers['authorization'];

  if (!bearerHeader) return res.status(403).send({ message: "No token provided!" });

  const bearer = bearerHeader.split(' ');
  const bearerToken = bearer[1];

  jwt.verify(bearerToken, config.SECRET, (err, decoded) => {
    if (err) return res.status(401).send({ message: "Unauthorized!" });
    req.token = bearerToken;
    // req.userId = decoded.id;
    next();
  });
};

const authJwt = {
  verifyToken
}

module.exports = authJwt;

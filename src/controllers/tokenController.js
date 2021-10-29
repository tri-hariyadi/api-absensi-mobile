const config = require("../config/config").get(process.env.NODE_ENV);
const Tokens = require('../models/Tokens');
const responseWrapper = require('../config/responseWrapper');

const jwt = require('jsonwebtoken');

module.exports = {
  refreshToken: (req, res, next) => {
    let bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(403).send({ message: "No token provided!" });
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    Tokens.findOne({ token: bearerToken }, (err, result) => {
      if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
      if (!result) return res.status(401).send({ message: "Invalid token!" });
      if (result) {
        jwt.verify(bearerToken, config.SECRET, (err, resultJWTDecoded) => {
          if (err && err.message !== 'jwt expired') return res.status(401).send({ message: "Unauthorized!" });
          let decoded = jwt.decode(bearerToken, { complete: true });
          if (!decoded) return res.status(403).send(responseWrapper(null, 'Something went wrong', 403));
          if (decoded) {
            let newAccessToken = jwt.sign({
              idUser: decoded.payload.idUser,
              username: decoded.payload.username,
              organisation: decoded.payload.organisation,
              division: decoded.payload.division,
              avatar: decoded.payload.image
            }, config.SECRET, {
              expiresIn: 3600
            });
            Tokens.updateOne({ _id: result._id }, { token: newAccessToken }, (err, tokens) => {
              if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
              res.status(200).send(responseWrapper({ newAccessToken }, 'Success Refresh Token', 200));
            });
          }
        });
      }
    })
  },

  revokeToken: async (req, res, next) => {
    let bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(403).send({ message: "No token provided!" });
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];

    Tokens.findOneAndDelete({ token: bearerToken }, (err, result) => {
      if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
      if (!result) return res.status(401).send({ message: "Invalid token!" });
      res.status(200).send({ message: 'Success revoke token' });
    });
  }
}

const config = require('../config/config').get(process.env.NODE_ENV);

const verifyApiKey = (req, res, next) => {
  let apiKey = req.header('X-Api-Key');
  if (apiKey !== config.APIKEY) {
    return res.status(401).send({ message: "Unauthorized!" });
  }
  next();
};

module.exports = verifyApiKey;
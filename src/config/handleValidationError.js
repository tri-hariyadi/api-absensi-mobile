const responseWrapper = require('./responseWrapper');

const handleValidationError = (err, res) => {
  if (err) {
    let errors = Object.values(err.errors).map(el => el.message);
    let code = 400;
    if (errors.length > 1) {
      const formattedErrors = errors.join(', ');
      res.status(code).send(responseWrapper(null, formattedErrors, code));
    } else {
      res.status(code).send(responseWrapper(null, errors[0], code));
    }
  }
}

module.exports = handleValidationError;

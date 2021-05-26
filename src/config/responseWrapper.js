const responseWrapper = (data, message, status) => ({
  result: data,
  message: message,
  status: status
});

module.exports = responseWrapper;

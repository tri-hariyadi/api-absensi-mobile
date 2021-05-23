const responseWrapper = (data, message, status) => ({
  data: data,
  message: message,
  status: status
});

module.exports = responseWrapper;

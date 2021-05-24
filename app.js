const cors = require("cors");
const express = require('express');
const createError = require('http-errors');

const app = express();

var corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

// database connection  
require('./initDB');

const userManagement = require('./src/routes/userManagement');

app.use('/api/v1/absensiMobile/', userManagement);

//404 handler and pass to error handler
app.use((req, res, next) => {
  next(createError(404, 'Not found'));
});

//Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message
    }
  });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log('Server started on port ' + PORT + '...');
});

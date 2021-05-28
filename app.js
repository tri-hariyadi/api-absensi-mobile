const cors = require("cors");
const express = require('express');
const createError = require('http-errors');
var path = require('path');

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors(corsOptions));

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

require('dotenv').config();
// database connection  
require('./initDB');

const userManagement = require('./src/routes/userManagement');
const absensi = require('./src/routes/absent');
const kas = require('./src/routes/kas');

app.use('/api/v1/absensiMobile/', userManagement);
app.use('/api/v1/absensiMobile/', absensi);
app.use('/api/v1/absensiMobile/', kas);

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

// const PORT = process.env.PORT || 8081;
const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(PORT, () => {
  console.log('Server started on port ' + PORT + '...');
});

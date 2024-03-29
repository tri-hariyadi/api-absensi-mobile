const cors = require("cors");
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const responseWrapper = require('./src/config/responseWrapper');

const app = express();

var corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token'],
  optionsSuccessStatus: 200
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
const token = require('./src/routes/token');
const attandenceTag = require('./src/routes/attendanceTag');

app.use('/api/v1/absensiMobile/', userManagement);
app.use('/api/v1/absensiMobile/', absensi);
app.use('/api/v1/absensiMobile/', kas);
app.use('/api/v1/absensiMobile/', token);
app.use('/api/v1/absensiMobile/', attandenceTag);

//404 handler and pass to error handler
app.use((req, res, next) => {
  // next(createError(404, 'Not found'));
  res.status(404).send(responseWrapper(null, 'Not Found', 404));
});

//Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(responseWrapper(null, err.message, err.status || 500));
});

// const PORT = process.env.PORT || 8081;
const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 8082) : 8082;
app.listen(PORT, () => {
  console.log('Server started on port ' + PORT + '...');
});

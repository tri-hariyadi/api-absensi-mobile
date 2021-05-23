const mongoose = require('mongoose');
const db = require('./src/config/config').get(process.env.NODE_ENV);

mongoose.Promise = global.Promise;
mongoose.connect(db.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => {
  console.log('Successfully connect to database.');
}).catch(err => {
  console.log('Can not connect to database');
  process.exit();
});

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to db...');
});

mongoose.connection.on('error', err => {
  console.log(`${err.message}...`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose connection is disconnected...');
});

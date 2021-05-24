const config = {
  production: {
    SECRET: process.env.SECRET,
    DATABASE: process.env.MONGODB_URI,
    APIKEY: process.env.API_KEY
  },
  default: {
    SECRET: 'mysecretkey',
    DATABASE: 'mongodb://localhost:27017/absensi_mobile',
    APIKEY: 'd5ba15b0-959a-4092-a7a9-66d8e7f46a08'
  }
}

exports.get = function get(env) {
  return config[env] || config.default
}
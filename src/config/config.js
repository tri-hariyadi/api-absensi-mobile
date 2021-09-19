const config = {
  production: {
    SECRET: process.env.SECRET,
    DATABASE: process.env.QOVERY_MONGODB_Z5E39DB5E_DATABASE_URL,
    APIKEY: process.env.API_KEY,
    API_BASE_URl: process.env.API_BASE_URl
  },
  default: {
    SECRET: 'mysecretkey',
    DATABASE: 'mongodb://localhost:27017/absensi_mobile',
    APIKEY: 'd5ba15b0-959a-4092-a7a9-66d8e7f46a08',
    API_BASE_URl: ''
  }
}

exports.get = function get(env) {
  return config[env] || config.default
}
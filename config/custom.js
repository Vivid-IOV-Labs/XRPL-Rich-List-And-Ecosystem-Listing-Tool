module.exports.custom = {
  mongodbDatabase: {
    uri: process.env.DB_URI,
  },
  node: {
    environment: process.env.NODE_ENV,
  },
};

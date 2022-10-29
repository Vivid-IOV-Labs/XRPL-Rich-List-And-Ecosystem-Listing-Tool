require('dotenv').config();

module.exports.datastores = {
  default: {
    adapter: require('sails-mongo'),
    url: process.env.DB_URI,
  },
};

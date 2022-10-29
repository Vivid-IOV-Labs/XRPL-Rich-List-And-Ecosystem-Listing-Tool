/**
 * Richlist.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'Richlist',
  attributes: {
    hash: {
      type: 'string',
      required: true,
      unique: true,
    },

    ledgeIndex: {
      type: 'number',
      required: true,
      unique: true,
    },

    ledgerCloseTime: {
      type: 'string',
      unique: true,
      required: true,
    },
    circulatingSupply: {
      type: 'number',
      required: true,
    },
    totalSupply: {
      type: 'number',
      required: true,
    },
    percents: {
      type: 'json',
      required: true,
    },
    accountsToCheckNfts: {
      type: 'json',
      required: true,
    },
  },
};

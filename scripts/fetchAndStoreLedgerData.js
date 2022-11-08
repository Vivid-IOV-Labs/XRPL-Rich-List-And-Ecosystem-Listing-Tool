const path = require('path');
const { Client } = require('xrpl');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

let retry = 3;

const getLedgerData = async ({ client, type = 'account', ledger = null, marker = undefined }) => {
  try {
    let payload = {
      command: 'ledger_data',
      limit: 200,
      ledger,
      type,
    };

    if (marker) {
      payload.marker = marker;
    }

    const response = await client.request(payload);
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

const getLedgerInfo = async ({ client, ledgerIndex = 'closed' }) => {
  try {
    const response = await client.request({
      command: 'ledger',
      // eslint-disable-next-line camelcase
      ledger_index: ledgerIndex,
    });
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

const dropPreviousCollection = async (database) => {
  return new Promise(async (resolve, reject) => {
    if (database) {
      const collections = await database.listCollections();
      await collections.forEach(async (collection, index) => {
        if (collection.name === 'account') {
          console.log(`Dropping ${collection.name}`);
          await database.collection(collection.name).drop();
        }
        if (index === collections.length) {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

const richlist = async (ledgerIndex = null, marker = null) => {
  const client = new Client(process.env.WSS_CLIENT_URL);
  console.log(process.env.DB_URI);
  const mongoClient = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  let ledger = null;
  let currentLedgerHash = '';

  try {
    await client.connect();
    console.log('Fetching data from XRPL');

    await mongoClient.connect();
    const db = await mongoClient.db('Richlist');

    if (!ledgerIndex) {
      await dropPreviousCollection(db);
    }

    const accountCollection = await db.collection('account');
    const ledgerCollection = await db.collection('ledger');
    console.log('Connected to mongodb');

    let i = 0;
    let j = 0;
    let accountsArray = [];

    if (!ledgerIndex) {
      const getCurrentClosedLedgerInfo = await getLedgerInfo({ client });
      ledger = getCurrentClosedLedgerInfo.result.ledger;
      currentLedgerHash = ledger.hash;

      let stats = {
        _id: ledger.hash,
        hash: ledger.hash,
        ledgeIndex: parseInt(ledger.ledger_index),
        closeTimeHuman: ledger.close_time_human,
        totalCoins: parseInt(ledger.total_coins) / 1000000,
      };

      // Adding the ledger stats in DB
      await ledgerCollection.insertOne(stats);
    } else {
      const getCurrentClosedLedgerInfo = await getLedgerInfo({ client, ledgerIndex });
      ledger = getCurrentClosedLedgerInfo.result.ledger;
      currentLedgerHash = ledger.hash;
    }

    console.log('Ledger Hash:', currentLedgerHash);

    // Iterate till the marker is undefined
    while (marker !== 'undefined') {
      const data = await getLedgerData({ client, ledger: currentLedgerHash, marker });

      // Manipulate the data from xrpl
      if (data.result.state !== null) {
        data.result.state.forEach((i) => {
          accountsArray.push({
            // eslint-disable-next-line camelcase
            ledger_id: ledger.hash,
            account: i.Account,
            balance: parseInt(i.Balance) / 1000000,
          });
        });

        i += 1;

        // Batch insert in DB
        if (i === 2000) {
          if (j % 4 === 0) {
            console.log('Reconnecting websocket');
            await client.disconnect();
            await client.connect();
            console.log('Connected to websocket');
          }

          await accountCollection.insertMany(accountsArray);
          console.log(`${i} Documents Inserted`);
          accountsArray = [];
          i = 0;
          j += 1;
        }
      }

      if (typeof data.result.marker === 'undefined' || data.result.marker === null || data.result.marker === marker) {
        marker = 'undefined';
      } else {
        marker = data.result.marker;
      }
    }

    // If some accountCollection are present in the array insert in DB
    if (accountsArray.length > 0) {
      await accountCollection.insertMany(accountsArray);
      console.log(`${i} Documents Inserted, Current marker ${marker}`);
      accountsArray = [];
      i = 0;
    }

    console.log('Completed.');
  } catch (error) {
    if (retry > 0 && ledger && marker) {
      retry -= 1;
      richlist(ledger.ledger_index, marker);
    } else {
      console.log(error);
    }
  } finally {
    // Ensures that the client connection is closed
    await client.disconnect();
    await mongoClient.close();
  }
};

richlist();

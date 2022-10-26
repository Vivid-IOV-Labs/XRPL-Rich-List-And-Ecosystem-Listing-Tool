const path = require('path');
const { Client } = require('xrpl');
const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

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
    console.log(error);
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
    console.log(error);
    throw new Error(error);
  }
};

const richlist = async () => {
  const client = new Client(process.env.WSS_CLIENT_URL);
  const mongoClient = new MongoClient(process.env.MONGO_SERVER_URL, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

  try {
    await client.connect();
    console.log('Fetching data from XRPL');

    await mongoClient.connect();
    const db = await mongoClient.db('Richlist');
    const accountCollection = await db.collection('account');
    const ledgerCollection = await db.collection('ledger');
    console.log('Connected to mongodb');

    const getCurrentClosedLedgerInfo = await getLedgerInfo({ client });
    const ledger = getCurrentClosedLedgerInfo.result.ledger;
    const currentLedgerHash = ledger.hash;
    let accountsArray = [];
    let marker = null;
    let i = 0;

    let stats = {
      _id: ledger.hash,
      hash: ledger.hash,
      ledgeIndex: parseInt(ledger.ledger_index),
      closeTimeHuman: ledger.close_time_human,
      totalCoins: parseInt(ledger.total_coins) / 1000000,
    };

    // Adding the ledger stats in DB
    await ledgerCollection.insertOne(stats);
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
        if (i === 200) {
          await accountCollection.insertMany(accountsArray);
          console.log(`${i} Documents Inserted`);
          accountsArray = [];
          i = 0;
        }
      }

      if (typeof data.result.marker === 'undefined' || data.result.marker === null || data.result.marker === marker) {
        marker = 'undefined';
      } else {
        marker = data.result.marker;
        console.log('Current Marker:', marker);
      }
    }

    // If some accountCollection are present in the array insert in DB
    if (accountsArray.length > 0) {
      await accountCollection.insertMany(accountsArray);
      console.log(`${i} Documents Inserted`);
      accountsArray = [];
      i = 0;
    }

    console.log('Completed.');
  } catch (error) {
    console.log(error);
  } finally {
    // Ensures that the client connection is closed
    await client.disconnect();
    await mongoClient.close();
  }
};

richlist();

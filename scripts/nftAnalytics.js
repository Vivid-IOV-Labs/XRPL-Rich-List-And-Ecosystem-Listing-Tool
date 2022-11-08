const path = require('path');
const { Client } = require('xrpl');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const getAccountNfts = async (account, marker = null, client) => {
  try {
    const payload = {
      command: 'account_nfts',
      account: account,
      // eslint-disable-next-line camelcase
      ledger_index: 'validated',
    };

    if (marker) {
      payload.marker = marker;
    }

    const response = await client.request(payload);
    let nfts = response.result.account_nfts;

    if (response.result.marker) {
      nfts = [...nfts, ...getAccountNfts(account, marker, client)];
    }

    return nfts;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const nftAnalytics = async () => {
  try {
    const client = new Client(process.env.WSS_CLIENT_URL);
    const mongoClient = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connecting to XRPL');
    await mongoClient.connect();
    console.log('Connecting to DB');

    const data = await mongoClient.db('Richlist').collection('percents').find().toArray();
    const accounts = data[0].accountsToCheckNfts;
    const accountNfts = [];

    if (!accounts) {
      console.log('No Data Found');
      return;
    }

    accounts.forEach(async ({ account }) => {
      const nfts = await getAccountNfts(account, client);

      // use only stored nfts that we are tracking
      if (nfts.length > 0) {
        accountNfts.push({
          account,
          nfts,
        });
      }
    });
  } catch (error) {
    console.log(error);
  } finally {
    // Ensures that the client connection is closed
    await client.disconnect();
    await mongoClient.close();
  }
};

nftAnalytics();

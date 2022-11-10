const path = require('path');
const { Client } = require('xrpl');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const getAccountNfts = async (account, marker = null, client) => {
    try {
        const payload = {
            command: 'account_nfts',
            account,
            // eslint-disable-next-line camelcase
            ledger_index: 'validated',
        };

        if (marker) {
            payload.marker = marker;
        }
        console.log(`Fetching NFTs of account: ${account}, with marker: ${marker}`);
        const response = await client.request(payload);
        let nfts = response.result.account_nfts;

        if (response.result.marker) {
            const moreNfts = await getAccountNfts(account, response.result.marker, client);
            nfts = [...nfts, ...moreNfts];
        }

        return nfts;
    } catch (error) {
        console.log(error);
        return [];
    }
};

const nftAnalytics = async (percent) => {
    const client = new Client(process.env.WSS_CLIENT_URL);
    const mongoClient = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connecting to XRPL');
        await mongoClient.connect();
        console.log('Connecting to DB');

        const db = await mongoClient.db('Richlist');
        console.log('Getting all accounts');
        const accountCollection = await db.collection('account').find().toArray();
        console.log('Sorting all accounts');
        const accounts = accountCollection.sort((a, b) => {
            return a.balance > b.balance ? -1 : b.balance > a.balance ? 1 : 0;
        });
        let n = Math.round((accounts.length / 100) * percent);
        const currAccounts = accounts.slice(0, n);
        // const currAccounts = [{ account: 'rBLadExFZKY7AqpTDxqSoWJgmgVZyA6wcX' }];
        const nftsToTrack = await db.collection('nftIssuer');
        console.log('Total Accounts:', currAccounts.length);
        const accountNfts = {};

        if (!currAccounts) {
            console.log('No Data Found');
            return;
        }

        for (index in currAccounts) {
            const account = currAccounts[index].account;
            const nfts = await getAccountNfts(account, null, client, nftsToTrack);

            if (nfts.length > 0) {
                for (i in nfts) {
                    const issuer = nfts[i].Issuer;
                    const exists = await nftsToTrack.countDocuments({ issuer });
                    // if (exists) {
                    //     accountNfts[issuer] = accountNfts[issuer] ? accountNfts[issuer] + 1 : 1;
                    // }
                    accountNfts[issuer] = accountNfts[issuer] ? accountNfts[issuer] + 1 : 1;
                }
            }
        }
        console.log(accountNfts);
    } catch (error) {
        console.log(error);
    } finally {
        // Ensures that the client connection is closed
        await client.disconnect();
        await mongoClient.close();
    }
};

nftAnalytics(0.2);

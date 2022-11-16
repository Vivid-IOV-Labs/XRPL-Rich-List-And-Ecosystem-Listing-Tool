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

const findPreviousRank = (issuer, nfts) => {
    if (!nfts || nfts.length === 0) return null;

    for (i in nfts) {
        if (nfts[i].issuer === issuer) {
            return nfts[i].rank;
        }
    }
    return null;
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

        const ledgerCollection = await db.collection('ledger').find().sort({ closeTimeHuman: -1 }).toArray();
        const currentLedgerDetails = ledgerCollection[0];

        const nfTokens = await db.collection('nfTokens');
        const checkIfExists = await nfTokens.find({ hash: currentLedgerDetails.hash }).toArray();

        if (checkIfExists.length > 0) {
            console.log('Details already present');
            return;
        }
        const lastNfToken = await nfTokens.find().sort({ closeTimeHuman: -1 }).toArray();
        const previousNftokens = lastNfToken[0] ? lastNfToken[0].topPercent.nfts : [];

        console.log('Getting all accounts');
        const accountCollection = await db.collection('account').find().toArray();
        console.log('Sorting all accounts');

        const accounts = accountCollection.sort((a, b) => {
            return a.balance > b.balance ? -1 : b.balance > a.balance ? 1 : 0;
        });
        let n = Math.round((accounts.length / 100) * percent);
        const currAccounts = accounts.slice(0, n);
        let currBalance = 0;
        // const nftsToTrack = await db.collection('nftIssuer');
        console.log('Total Accounts:', currAccounts.length);
        const accountNfts = {};
        const accountTaxons = {};

        if (!currAccounts) {
            console.log('No Data Found');
            return;
        }

        for (index in currAccounts) {
            const account = currAccounts[index].account;
            currBalance += currAccounts[index].balance;
            const nfts = await getAccountNfts(account, null, client);

            if (nfts.length > 0) {
                for (i in nfts) {
                    const issuer = nfts[i].Issuer;
                    const taxon = nfts[i].NFTokenTaxon;
                    // const exists = await nftsToTrack.countDocuments({ issuer });
                    // if (exists) {
                    //     accountNfts[issuer] = accountNfts[issuer] ? accountNfts[issuer] + 1 : 1;
                    // }
                    accountNfts[issuer] = accountNfts[issuer] ? accountNfts[issuer] + 1 : 1;

                    if (accountTaxons[issuer] && !accountTaxons[issuer].includes(taxon)) {
                        accountTaxons[issuer].push(taxon);
                    } else {
                        accountTaxons[issuer] = [taxon];
                    }
                }
            }
        }

        const currLedgerNfts = Object.entries(accountNfts).sort((a, b) => b[1] - a[1]);
        const nfts = currLedgerNfts.map((nft, index) => {
            const issuer = nft[0];
            const rank = index + 1;
            const count = nft[1];
            const prevRank = findPreviousRank(issuer, previousNftokens);
            let directionOfChange = prevRank ? prevRank - rank : 0;

            return {
                issuer,
                rank,
                count,
                directionOfChange,
                taxon: accountTaxons[issuer],
            };
        });

        const result = {
            ...currentLedgerDetails,
            topPercent: {
                percent,
                numberOfAccounts: currAccounts.length,
                aggregateBalances: currBalance,
                nfts,
            },
        };

        // await nfTokens.insertOne(result);
        console.log(JSON.stringify(result, null, '\t'));
    } catch (error) {
        console.log(error);
    } finally {
        // Ensures that the client connection is closed
        await client.disconnect();
        await mongoClient.close();
    }
};

nftAnalytics(0.2);

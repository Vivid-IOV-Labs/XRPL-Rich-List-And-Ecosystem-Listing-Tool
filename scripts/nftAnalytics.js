const path = require('path');
const { Client } = require('xrpl');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const getAccountNfts = async (account, marker = null, client, index) => {
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
        console.log(`[${index}]: Fetching NFTs of account: ${account}, with marker: ${marker}`);
        const response = await client.request(payload);
        let nfts = response.result.account_nfts;

        if (response.result.marker) {
            const moreNfts = await getAccountNfts(account, response.result.marker, client, index);
            nfts = [...nfts, ...moreNfts];
        }

        return nfts;
    } catch (error) {
        console.log(error);
        return [];
    }
};

const findPreviousRank = (key, nfts) => {
    if (!nfts || nfts.length === 0) {
        return null;
    }

    for (i in nfts) {
        if (nfts[i].key === key) {
            return nfts[i].rank;
        }
    }
    return null;
};

const findPreviousCount = (account, key, previousLedgerAccountData) => {
    if (!previousLedgerAccountData || previousLedgerAccountData.length === 0) {
        return null;
    }

    let collections = [];

    for (i in previousLedgerAccountData) {
        if (previousLedgerAccountData[i].account === account) {
            collections = previousLedgerAccountData[i].collections;
            break;
        }
    }

    for (i in collections) {
        if (collections[i].key === key) {
            return collections[i].rank;
        }
    }

    return null;
};

const isIncluded = (nfTokenDetails, taxon, tokenId) => {
    for (i in nfTokenDetails) {
        if (nfTokenDetails[i].taxon === taxon && nfTokenDetails[i].tokenId === tokenId) return true;
    }

    return false;
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

        const ledgerCollection = await db.collection('ledger').find().sort({ _id: -1 }).toArray();
        const currentLedgerDetails = ledgerCollection[0];

        const nfTokens = await db.collection('nfTokens');
        const checkIfExists = await nfTokens.find({ hash: currentLedgerDetails.hash }).toArray();

        if (checkIfExists.length > 0) {
            console.log('Details already present', currentLedgerDetails.hash);
            return;
        }

        const lastNfToken = await nfTokens.find().sort({ _id: -1 }).toArray();
        const previousNftokens = lastNfToken[0] ? lastNfToken[0].topPercent.nfts : [];
        const previousAccountList = lastNfToken[0] ? lastNfToken[0].topPercent.accountList : [];

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
        const nfTokenDetails = {};
        const accountWithCorrespondingNfts = [];

        if (!currAccounts) {
            console.log('No Data Found');
            return;
        }

        for (index in currAccounts) {
            const account = currAccounts[index].account;
            currBalance += currAccounts[index].balance;
            const nfts = await getAccountNfts(account, null, client, index);
            let obj = { account, balance: currAccounts[index].balance, collections: [] };

            // Temporary reconnection logic
            if (index === 2000) {
                console.log('Re-connecting again...');
                await client.disconnect();
                await client.connect();
                console.log('Re-connected');
            }

            if (nfts.length > 0) {
                for (i in nfts) {
                    const issuer = nfts[i].Issuer;
                    const taxon = parseInt(nfts[i].NFTokenTaxon);
                    const nftListKey = `${issuer}_${taxon}`;
                    const tokenId = nfts[i].NFTokenID;
                    accountNfts[nftListKey] = accountNfts[nftListKey] ? accountNfts[nftListKey] + 1 : 1;

                    if (nfTokenDetails[nftListKey] && !isIncluded(nfTokenDetails, taxon, tokenId)) {
                        nfTokenDetails[nftListKey].push({ taxon, tokenId });
                    } else {
                        nfTokenDetails[nftListKey] = [{ taxon, tokenId }];
                    }
                }

                const sortednf = Object.entries(nfTokenDetails)
                    .sort(([, a], [, b]) => b.length - a.length)
                    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

                let rank = 1;

                for (key in sortednf) {
                    const prevRank = findPreviousCount(account, key, previousAccountList);
                    const [issuer, taxon] = key.split('_');
                    obj.collections.push({
                        key,
                        issuer,
                        taxon: parseInt(taxon),
                        rank,
                        nfts: nfTokenDetails[key],
                        change: prevRank ? prevRank - rank : 0,
                    });
                    rank += 1;
                }

                accountWithCorrespondingNfts.push(obj);
            }
        }

        const currLedgerNfts = Object.entries(accountNfts).sort((a, b) => b[1] - a[1]);
        const nfts = currLedgerNfts.map((nft, index) => {
            const [issuer, taxon] = nft[0].split('_');
            const count = nft[1];
            const rank = index + 1;
            const prevRank = findPreviousRank(nft[0], previousNftokens);
            let directionOfChange = prevRank ? prevRank - rank : 0;

            return {
                issuer,
                taxon: parseInt(taxon),
                rank,
                count,
                directionOfChange,
                nfts: nfTokenDetails[nft[0]],
            };
        });

        const result = {
            ...currentLedgerDetails,
            topPercent: {
                percent,
                numberOfAccounts: currAccounts.length,
                aggregateBalances: currBalance,
                nftList: nfts,
                accountList: accountWithCorrespondingNfts,
            },
        };

        await nfTokens.insertOne(result);
    } catch (error) {
        console.log(error);
    } finally {
        // Ensures that the client connection is closed
        await client.disconnect();
        await mongoClient.close();
    }
};

nftAnalytics(0.2);

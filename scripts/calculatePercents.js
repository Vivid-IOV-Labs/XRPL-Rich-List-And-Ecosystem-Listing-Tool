const path = require('path');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const calculatePercents = async () => {
    const mongoClient = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        const db = await mongoClient.db('Richlist');
        const accountCollection = await db.collection('account').find().toArray();
        const ledgerCollection = await db
            .collection('ledger')
            .find({}, { sort: { timestamp: -1 }, limit: 1 })
            .toArray();
        const percentsCollection = await db.collection('percents');
        const { hash, ledgeIndex, closeTimeHuman, totalCoins } = ledgerCollection[0];
        const percents = [0.01, 0.1, 0.2, 0.5, 1, 2, 3, 4, 5, 10, 15, 25, 34.19];
        const accounts = accountCollection.sort((a, b) => {
            return a.balance > b.balance ? -1 : b.balance > a.balance ? 1 : 0;
        });
        const numberOfAccounts = accounts.length;
        let circulatingSupply = 0.0;
        const percentResults = [];

        percents.forEach((p) => {
            let n = Math.round((numberOfAccounts / 100) * p);
            const currAccounts = accounts.slice(0, n);
            let e = 0.0;

            currAccounts.forEach((a) => {
                e += a.balance;
            });

            circulatingSupply += e;
            percentResults.push({ percentage: p, numberOfAccounts: n, aggregateBalances: e, minBalance: currAccounts[currAccounts.length - 1].balance });
        });

        await percentsCollection.insertOne({
            hash,
            ledgeIndex,
            ledgerCloseTime: closeTimeHuman,
            circulatingSupply,
            totalSupply: totalCoins,
            percents: percentResults,
        });
    } catch (error) {
        console.log(error);
    } finally {
        await mongoClient.close();
    }
};

calculatePercents();

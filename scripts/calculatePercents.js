const path = require('path');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const calculatePercents = async () => {
    console.log('Starting the calculatePercents function...');
    const mongoClient = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        console.log('Connecting to MongoDB...');
        await mongoClient.connect();
        console.log('Connected to MongoDB.');

        const db = mongoClient.db('Richlist');
        const percentsCollection = db.collection('percents');
        const ledgerCollection = db.collection('ledger');
        const accountCollection = db.collection('account');

        console.log('Fetching the latest ledger record...');
        const latestLedger = await ledgerCollection.find().sort({ _id: -1 }).limit(1).next();
        const { hash, ledgeIndex, closeTimeHuman, totalCoins } = latestLedger;
        console.log(`Latest ledger record fetched: ${hash}`);

        console.log('Checking if record already exists...');
        const doesExist = await percentsCollection.countDocuments({ hash });
        if (doesExist > 0) {
            console.log(`The record already exists for ${hash}`);
            return;
        }

        console.log('Initializing variables...');
        const percents = [0.01, 0.1, 0.2, 0.5, 1, 2, 3, 4, 5, 10, 15, 25, 34.19];

        console.log('Fetching the last record from percents collection...');
        const lastPercents = await percentsCollection.find().sort({ _id: -1 }).limit(1).next();

        console.log('Counting total number of accounts...');
        const totalNumberOfAccounts = await accountCollection.countDocuments();
        console.log(`Total number of accounts: ${totalNumberOfAccounts}`);

        const percentResults = percents.map(p => ({ percentage: p, numberOfAccounts: 0, aggregateBalances: 0, minBalance: Infinity }));
        let idx = 0;
        let circulatingSupply = 0;

        console.log('Iterating through sorted account records...');
        const accountCursor = accountCollection.find().sort({ balance: -1 });
        await accountCursor.forEach((account) => {
            idx++;
            circulatingSupply += parseFloat(account.balance);

            // Update the console inline with the account index
            process.stdout.write(`\rProcessing account ${idx} : ${account.balance}...`);

            percents.forEach((p, i) => {
                const n = Math.round((totalNumberOfAccounts / 100) * p);
                if (idx < n) {
                    percentResults[i].numberOfAccounts++;
                    percentResults[i].aggregateBalances += account.balance;
                    percentResults[i].minBalance = account.balance;
                }
            });
        });

        let numberOfAccountsChange = 0;
        let percentAccountChange = 0.0;

        if (lastPercents) {
            numberOfAccountsChange = totalNumberOfAccounts - lastPercents.totalAccounts;
            percentAccountChange = parseFloat(((numberOfAccountsChange / lastPercents.totalAccounts) * 100).toFixed(2));
        }

        console.log('Inserting new record into percents collection...');
        console.log(JSON.stringify({
            hash,
            ledgeIndex,
            ledgerCloseTime: closeTimeHuman,
            circulatingSupply,
            totalSupply: totalCoins,
            totalAccounts: totalNumberOfAccounts,
            numberOfAccountsChange,
            percentAccountChange,
            percents: percentResults,
        }, null, "\t"));

        await percentsCollection.insertOne({
            hash,
            ledgeIndex,
            ledgerCloseTime: closeTimeHuman,
            circulatingSupply,
            totalSupply: totalCoins,
            totalAccounts: totalNumberOfAccounts,
            numberOfAccountsChange,
            percentAccountChange,
            percents: percentResults,
        });
        console.log('New record inserted successfully.');
    } catch (error) {
        console.log('An error occurred:', error);
    } finally {
        console.log('Closing MongoDB connection...');
        await mongoClient.close();
        console.log('MongoDB connection closed.');
    }
};

console.log('Invoking calculatePercents...');
calculatePercents();
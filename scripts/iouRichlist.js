const path = require('path');
const { Client } = require('xrpl');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const percent = 0.01;
const iouBalance = new Map();

const getTrustLines = async (client, accountDetails, ious, result) => {
    const { account, balance } = accountDetails;
    let marker = null;
    do {
        const { result: { lines, marker: nextMarker } } = await client.request({
            command: "account_lines",
            account,
            limit: 400,
            marker: marker ?? undefined
        });
        marker = nextMarker;

        lines.forEach((item) => {
            const key = item.account;
            if (ious.has(key)) {
                ious.get(key).push({ account: accountDetails.account, balance: accountDetails.balance });
                result[key] = (result[key] || 0) + 1;
                iouBalance.set(key, (iouBalance.get(key) || 0) + parseFloat(balance));
            }
        });
    } while (marker);
};

const iouRichlist = async (percent) => {
    const client = new Client(process.env.WSS_CLIENT_URL);
    const mongoClient = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        console.log("Working on IOU Richlist...");

        await client.connect();
        await mongoClient.connect();
        console.log("DB and Websocket connected!");
        const ious = await mongoClient.db('XRPL').collection("ious").find().toArray();
        const iouRichlist = mongoClient.db('Richlist').collection("iouRichlist");
        const iouObject = new Map();

        console.log('Checking if record already exists...');
        console.log('Fetching the latest ledger record...');
        const { _id, hash, ledgeIndex, ledgerCloseTime: closeTimeHuman, totalSupply: totalCoins } = await mongoClient.db('Richlist').collection("percents").find().sort({ _id: -1 }).limit(1).next();
        console.log(`Latest ledger record fetched: ${hash}`);

        const doesExist = await iouRichlist.countDocuments({ hash });
        if (doesExist > 0) {
            console.log(`The record already exists for ${hash}`);
            return;
        }

        ious.forEach(iou => {
            iouObject.set(iou.issuerAccount, []);
        });

        const accountCollection = mongoClient.db('Richlist').collection("account");
        const totalAccountsLength = await accountCollection.countDocuments();
        const limit = Math.round((totalAccountsLength / 100) * percent);
        const accounts = await accountCollection.find().sort({ balance: -1 }).limit(limit).toArray();

        const iouHeldByUserCount = {};
        let aggregateBalances = 0.0;

        const trustLinePromises = accounts.map(account => {
            aggregateBalances += account.balance;
            return getTrustLines(client, account, iouObject, iouHeldByUserCount);
        });

        await Promise.all(trustLinePromises);

        const iouList = Array.from(iouObject.keys()).map(key => {
            return {
                projectName: ious.find(iou => iou.issuerAccount === key).projectName,
                account: key,
                totalHolders: iouObject.get(key).length,
                totalHolderBalance: iouBalance.get(key) || 0,
                holders: iouObject.get(key),
            };
        });

        const result = {
            _id,
            hash,
            ledgeIndex,
            closeTimeHuman: new Date(closeTimeHuman).toISOString(),
            totalCoins,
            topPercent: {
                percent,
                aggregateBalances,
                numberOfAccounts: accounts.length,
                iouList,
            },
        };

        await iouRichlist.insertOne(result);
        console.log("IOU Richlist calculation success.");
    } catch (err) {
        console.log(err);
    } finally {
        await client.disconnect();
        await mongoClient.close();
    }
};

iouRichlist(percent);

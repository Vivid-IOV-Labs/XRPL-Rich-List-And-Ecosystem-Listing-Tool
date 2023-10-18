const path = require('path');
const { Client } = require('xrpl');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const percent = 0.2;
const iouBalance = new Map();

const getTrustLines = async (client, accountDetails, ious, result) => {
    const { account, balance } = accountDetails;
    let marker = null;
    do {
        try {
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

            console.log(`Fetching ${account} marker : ${marker}`);
        } catch (error) {
            console.error("An error occurred:", error);
            break; // Exit the loop if an error occurs
        }
    } while (marker);
};

const manipulateIOUList = (iouObject, ious, prevRankMap) => {
    const iouList = Array.from(iouObject.keys()).map(key => {
        return {
            projectName: ious.find(iou => iou.issuerAccount === key).projectName,
            account: key,
            totalHolders: iouObject.get(key).length,
            totalHolderBalance: iouBalance.get(key) || 0,
            holders: iouObject.get(key),
        };
    });

    // sort for rank
    iouList.sort((a, b) => b.totalHolders - a.totalHolders);

    // Add rank and directionOfChange
    iouList.forEach((iou, index) => {
        const currentRank = index + 1;
        const prevRank = prevRankMap.get(iou.account);
        iou.rank = currentRank;
        iou.directionOfChange = prevRank ? prevRank - currentRank : 0;
    });

    return iouList;
}

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

        // Fetch the previous iouList from the database
        const prevRecord = await iouRichlist.find().sort({ _id: -1 }).limit(1).next();
        const prevIouList = prevRecord ? prevRecord.topPercent.iouList : [];
        const prevRankMap = new Map();
        prevIouList.forEach((iou, index) => {
            prevRankMap.set(iou.account, index + 1);
        });

        console.log('Checking if record already exists...');
        console.log('Fetching the latest ledger record...');
        const { _id, hash, ledgeIndex, ledgerCloseTime: closeTimeHuman, totalSupply: totalCoins } = await mongoClient.db('Richlist').collection("percents").find().sort({ _id: -1 }).limit(1).next();
        console.log(`Latest ledger record fetched: ${hash}`);

        const doesExist = await iouRichlist.countDocuments({ hash });
        if (doesExist > 0) {
            console.log(`The record already exists for ${hash}`);
            return;
        }

        ious.forEach(iou => { iouObject.set(iou.issuerAccount, []) });

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
        const iouList = manipulateIOUList(iouObject, ious, prevRankMap);

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


const path = require('path');
const { Client } = require('xrpl');
const { MongoClient } = require('mongodb');
const fetch = require("node-fetch");

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const trackedProjects = async () => {
    try {
        const client = new Client(process.env.WSS_CLIENT_URL);
        const mongoClient = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const headers = new fetch.Headers({
            'x-bithomp-token': process.env.BITHOMP_API_KEY
        })
        console.log('Fetching data...');
        await client.connect();
        await mongoClient.connect();

        const trackedAccountsCollection = await mongoClient.db('XRPL').collection("xls20Nfts");
        const trackedAccounts = await trackedAccountsCollection.find().toArray();
        console.log("Total Projects: ", trackedAccounts.length);

        for (i in trackedAccounts) {
            const { issuerAddress, collectionName } = trackedAccounts[i];
            let next_marker = null;
            let taxons = [];
            let objForTaxonSearch = {};

            do {
                const nfts = await fetch(`https://bithomp.com/api/cors/v2/nfts?list=nfts&issuer=${issuerAddress}&marker=${next_marker}`).then(
                    res => res.json()
                );

                if (nfts?.result && nfts.result === 'failed') {
                    console.error(nfts);
                    throw Error(nfts);
                }

                next_marker = nfts.marker;

                nfts.nfts?.forEach(nft => {
                    let { nftokenTaxon, issuer } = nft;
                    nftokenTaxon = parseInt(nftokenTaxon);
                    if (!objForTaxonSearch[nftokenTaxon] && issuer === issuerAddress) {
                        objForTaxonSearch[nftokenTaxon] = true;
                        console.log(`${i}. [${collectionName}] : ${nftokenTaxon}`);
                        taxons.push(nftokenTaxon)
                    }
                });
            } while (next_marker);

            trackedAccounts[i] = {
                ...trackedAccounts[i],
                taxon: taxons
            };

            // Update the collection
            await trackedAccountsCollection.updateOne(
                { _id: trackedAccounts[i]._id },
                { $set: { taxon: taxons } }
            );
        }

        await client.disconnect();
        await mongoClient.close();

        console.log("Update all tracked project details.")
    } catch (error) {
        console.log(error);
    }
};

trackedProjects();
const path = require('path');
const { Client } = require('xrpl');
const { MongoClient } = require('mongodb');
const fetch = require("node-fetch");

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const trackedProjects = async () => {
    try {

        const client = new Client(process.env.WSS_CLIENT_URL);
        const mongoClient = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Fetching data...');
        await client.connect();

        await mongoClient.connect();
        const trackedAccountsCollection = await mongoClient.db('XRPL').collection("xls20Nfts");
        const trackedAccounts = await trackedAccountsCollection.find().toArray();

        for (i in trackedAccounts) {
            const { issuerAddress, collectionName } = trackedAccounts[i];
            const nfts = await fetch(`https://api.xrpscan.com/api/v1/account/${issuerAddress}/nfts`).then(res => res.json());

            const taxons = [];
            const objForTaxonSearch = {};

            nfts.forEach(nft => {
                const { NFTokenTaxon, Issuer } = nft;
                if (!objForTaxonSearch[NFTokenTaxon] && Issuer === issuerAddress) {
                    objForTaxonSearch[NFTokenTaxon] = true;
                    taxons.push(NFTokenTaxon)
                }
            });
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
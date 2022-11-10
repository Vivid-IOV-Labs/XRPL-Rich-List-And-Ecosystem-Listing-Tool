const path = require('path');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const issuers = [
    {
        name: 'XPUNK',
        ticker: '5850554E4B000000000000000000000000000000',
        issuer: 'rHEL3bM4RFsvF8kbQj3cya8YiDvjoEmxLq',
    },
    {
        name: 'ELS',
        ticker: 'ELS',
        issuer: 'rHXuEaRYnnJHbDeuBH5w8yPh5uwNVh5zAg',
    },
    {
        name: 'editions',
        ticker: '65646974696F6E73000000000000000000000000',
        issuer: 'rfXwi3SqywQ2gSsvHgfdVsyZdTVM15BG7Z',
    },
    {
        name: 'XDUDE',
        ticker: '5844554445000000000000000000000000000000',
        issuer: 'rU5LE7X6yyu9DuHsLdHhWSiUVTgpyRK1vz',
    },
    {
        name: 'xShroom',
        ticker: '785368726F6F6D00000000000000000000000000',
        issuer: 'rHqLei9xJch13JioYHsDUwWJoz81QQh6LU',
    },
    {
        name: 'XReefs',
        ticker: '5852656566730000000000000000000000000000',
        issuer: 'rN1fBKQdLRcMUG8VCDihKPqmTgBfgSu4rm',
    },
    {
        name: 'CLUB',
        ticker: '434C554200000000000000000000000000000000',
        issuer: 'r9pAKbAMx3wpMAS9XvvDzLYppokfKWTSq4',
    },
    {
        name: 'CNFT',
        ticker: '434E465400000000000000000000000000000000',
        issuer: 'rUte5RZgB68nEU5QfjfM8qD6HtmKo5ebqo',
    },
    {
        name: 'JUNK',
        ticker: '4A554E4B00000000000000000000000000000000',
        issuer: 'r4pDJ7bT1rANe9nAdFR9pyVRwtJZQUEFpj',
    },
    {
        name: 'XZillas',
        ticker: '585A696C6C617300000000000000000000000000',
        issuer: 'rhwVLo1ckgcGSD6j7bF7BCPjuR3tshjbVM',
    },
    {
        name: 'Xpossum',
        ticker: '58706F7373756D00000000000000000000000000',
        issuer: 'rfQr7LLaNvG93A3e2h6tjub3pi2oNTbvMA',
    },
    {
        name: 'XLION',

        ticker: '584C494F4E000000000000000000000000000000',
        issuer: 'rU6ANcasdcDmRiF9JuW2rj7KYmPGKAEUYy',
    },
    {
        name: 'xKangaMK1',

        ticker: '784B616E67614D4B310000000000000000000000',
        issuer: 'rPwdrA6YFGR6k5rPyT6QPx7MrQAavUtyz5',
    },
    {
        name: 'xPizza',
        ticker: '7850697A7A610000000000000000000000000000',
        issuer: 'rUMwLWFzwcD2topAKsg5NBbhq7dtu4gRCU',
    },
];

const addIssuer = async (issuers) => {
    const mongoClient = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    if (issuers.length === 0) {
        return;
    }

    try {
        await mongoClient.connect();
        console.log('Connecting to DB');

        const db = await mongoClient.db('Richlist');
        const nftIssuers = await db.collection('nftIssuer');
        const count = await nftIssuers.countDocuments();

        if (count === 0) {
            await nftIssuers.insertMany(issuers);
            return;
        }

        for (i in issuers) {
            const doesExistInDb = await nftIssuers.findOne({ issuer: issuers[i].issuer });

            if (!doesExistInDb) {
                await nftIssuers.insertOne(issuers[i]);
            }
        }
    } catch (error) {
        console.log(error);
    } finally {
        await mongoClient.disconnect();
    }
};

addIssuer(issuers);

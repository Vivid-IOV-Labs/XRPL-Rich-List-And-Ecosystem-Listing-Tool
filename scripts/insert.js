const MongoClient = require('mongodb').MongoClient;
const path = require('path');

const csv = require('csv-parser');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const filepath = path.resolve(__dirname, "./listIOfAddressesToExclude.csv")
// Database Name
const dbName = 'Richlist';

// Create a new MongoClient
const client = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to the MongoDB client
client.connect(async function (err) {
    if (err) {
        console.error(err);
        return;
    }

    console.log("Connected successfully to server");
    const collection = await client.db(dbName).collection('addressesToSkip');

    // Read the CSV file
    fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', async (row) => {
            // Create a document from the row
            const document = { "address": row["_key"], "name": row["name"] };
            await collection.insertOne(document);
            // Insert the document into the corresponding collection
            console.log(document)
        })
    // .on('end', () => {
    //     console.log('CSV file successfully processed');
    //     client.close();
    // });
});

const mongoClient = Richlist.getDatastore().manager.client;
const { response } = require('./response');

const fetchDropsFromDB = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };
    try {
        let data = await mongoClient.db('XRPL').collection('xls20Nfts').find().toArray();

        if (!data) {
            resObj.data = null;
            resObj.success = false;
            resObj.error = true;
            resObj.message = 'Internal Error';
            response(resObj, res);
            return;
        }

        // Filtering data to keep only documents where mintDate is present and older than current date
        const currentDate = new Date().getTime();
        data = data.filter(doc => {
            if (doc.mintDate) {
                const docMintDate = new Date(doc.mintDate).getTime();
                return docMintDate > currentDate;
            }
            return false;
        });

        const { query } = req;
        let { limit, page } = query;
        limit = limit ? parseInt(limit) : 10;
        page = page ? parseInt(page) - 1 : 0;

        if (limit < 0 || page < 0 || limit > 200) {
            resObj.data = null;
            resObj.success = false;
            resObj.error = true;
            resObj.message = 'Bad Params';
            response(resObj, res);
            return;
        }

        // slicing based on limit and page number
        const startingIndex = page * limit;
        const endingIndex = limit + startingIndex;
        data = data.slice(startingIndex, endingIndex);

        resObj.data = data;
        resObj.success = true;
        resObj.error = false;
        resObj.message = 'Success';
        response(resObj, res);
    } catch (error) {
        resObj.success = false;
        resObj.error = true;
        resObj.message = 'Some error occured';
        console.error(error);
        response(resObj, res);
    }
};

module.exports = {
    fetch: fetchDropsFromDB,
};

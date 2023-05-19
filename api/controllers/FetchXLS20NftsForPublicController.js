const mongoClient = Richlist.getDatastore().manager.client;
const { response } = require('./response');

const fetchXls20Nfts = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };
    try {
        const { query } = req;
        let { limit, page, search, searchKey } = query;
        limit = limit ? parseInt(limit) : 10;
        page = page ? parseInt(page) - 1 : 0;
        search = search ?? '';
        searchKey = searchKey ?? '';

        const collection = await mongoClient.db('XRPL').collection('xls20Nfts');
        let data = [];

        if (search && searchKey) {
            data = await collection.find({ [searchKey]: { $regex: search, $options: 'i' } }).toArray();
        } else {
            data = await collection.find().toArray();
        }

        if (!data) {
            resObj.data = null;
            resObj.success = false;
            resObj.error = true;
            resObj.message = 'Internal Error';
            response(resObj, res);
            return;
        }

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
        resObj.totalCount = data.length;
        data = data.slice(startingIndex, endingIndex);
        data = data.map(({ issuerAddress, collectionName }) => ({ issuerAccount: issuerAddress, projectName: collectionName }));

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
    fetch: fetchXls20Nfts,
};

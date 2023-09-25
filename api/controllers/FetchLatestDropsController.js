const mongoClient = Richlist.getDatastore().manager.client;
const analytics = require('./analytics');
const { response } = require('./response');

const fetchDropsFromDB = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };
    try {
        let data = await mongoClient.db('XRPL').collection('xls20Nfts').find({ "isDropsEnabled": true }).toArray();

        await analytics('xrp_nft_drops');

        if (!data) {
            resObj.data = null;
            resObj.success = false;
            resObj.error = true;
            resObj.message = 'Internal Error';
            response(resObj, res);
            return;
        }

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
        const totalCount = data.length;
        const startingIndex = page * limit;
        const endingIndex = limit + startingIndex;
        data = data.slice(startingIndex, endingIndex);

        resObj.data = { items: data, totalCount };
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

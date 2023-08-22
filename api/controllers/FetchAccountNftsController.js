const mongoClient = Richlist.getDatastore().manager.client;
const { response } = require('./response');

const fetchAccountNfts = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };
    try {
        const { query } = req;
        let { limit, page, nftsInfo } = query;
        const data = await mongoClient.db('Richlist').collection('nfTokens').find().sort({ _id: -1 }).toArray();
        const currData = data[0] ? data[0] : null;
        let accountList = await mongoClient.db('Richlist').collection('accountNfts').find().toArray();

        if (!currData || !currData.topPercent || !accountList) {
            resObj.data = null;
            resObj.success = false;
            resObj.error = true;
            resObj.message = 'Internal Error';
            response(resObj, res);
            return;
        }

        delete currData.topPercent.nftList;
        limit = limit ? parseInt(limit) : 10;
        page = page ? parseInt(page) - 1 : 0;

        if (limit < 0 || page < 0 || limit > 10) {
            resObj.data = null;
            resObj.success = false;
            resObj.error = true;
            resObj.message = 'Bad Params';
            response(resObj, res);
            return;
        }

        // slicing array based on limit and page number
        const startingIndex = page * limit;
        const endingIndex = limit + startingIndex;
        accountList = accountList.slice(startingIndex, endingIndex);

        if (nftsInfo === 'false') {
            accountList.forEach(({ collections }) => {
                collections.forEach((c) => {
                    if (c.nfts) {
                        delete c.nfts;
                    }
                });
            });
        }

        currData.topPercent.accountList = accountList;
        currData.closeTimeHuman = new Date(currData.closeTimeHuman).toISOString();
        resObj.data = currData;
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
    fetch: fetchAccountNfts,
};

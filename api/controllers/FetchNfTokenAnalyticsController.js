const mongoClient = Richlist.getDatastore().manager.client;
const { response } = require('./response');

const fetchNfTokens = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };
    try {
        const { query } = req;
        let { nftsInfo, top } = query;
        const data = await mongoClient.db('Richlist').collection('nfTokens').find().sort({ _id: -1 }).toArray();
        const currData = data[0] ? data[0] : null;

        if (!currData || !currData.topPercent || !currData.topPercent.nftList) {
            resObj.data = null;
            resObj.success = false;
            resObj.error = true;
            resObj.message = 'Internal Error';
            response(resObj, res);
            return;
        }

        if (nftsInfo === 'false') {
            const list = currData.topPercent.nftList;
            delete currData.topPercent.nftList;
            currData.topPercent.nftList = list.map(({ nfts, ...other }) => other);
        }

        if (top) {
            top = parseInt(top);
            currData.topPercent.nftList = currData.topPercent.nftList.slice(0, top);
        }

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
    fetch: fetchNfTokens,
};

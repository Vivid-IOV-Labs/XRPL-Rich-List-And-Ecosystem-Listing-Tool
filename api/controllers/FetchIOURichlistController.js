const mongoClient = Richlist.getDatastore().manager.client;
const analytics = require('./analytics');
const { response } = require('./response');

const fetchIOURichlist = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };
    try {
        const { query } = req;
        let { holderInfo } = query;
        await analytics('xrp_iou_richlist');

        const data = await mongoClient.db('Richlist').collection('iouRichlist').find().sort({ _id: -1 }).toArray();
        const currData = data[0] ? data[0] : null;

        if (!currData) {
            resObj.data = null;
            resObj.success = false;
            resObj.error = true;
            resObj.message = 'Internal Error';
            response(resObj, res);
            return;
        }

        if (holderInfo && holderInfo === 'false') {
            const list = currData.topPercent.iouList;
            delete currData.topPercent.iouList;
            currData.topPercent.iouList = list.map(({ holders, ...other }) => other);
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
    fetch: fetchIOURichlist,
};



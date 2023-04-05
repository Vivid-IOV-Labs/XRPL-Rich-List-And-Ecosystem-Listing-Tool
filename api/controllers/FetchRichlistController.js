const mongoClient = Richlist.getDatastore().manager.client;
const { response } = require('./response');

const fetchRichlist = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };
    try {
        const data = await mongoClient.db('Richlist').collection('percents').find().sort({ _id: -1 }).toArray();
        resObj.data = data[0] ? data[0] : null;
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
    fetch: fetchRichlist,
};

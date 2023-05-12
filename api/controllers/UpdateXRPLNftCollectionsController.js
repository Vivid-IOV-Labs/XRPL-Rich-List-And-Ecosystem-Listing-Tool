const mongoClient = Richlist.getDatastore().manager.client;
const { ObjectId } = require('mongodb');
const { response } = require('./response');
const { validate } = require('./ValidateJwtController');

const errorRes = (errorMsg, resObj, res) => {
    resObj.data = null;
    resObj.success = false;
    resObj.error = true;
    resObj.message = errorMsg;
    response(resObj, res);
};

const updateNFTs = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };

    try {
        await validate(req, res);
        const { body } = req;
        const { _id, ...data } = body;

        if (!data || !_id || data.length === 0) {
            errorRes('Please check the data again', resObj, res);
            return;
        }

        const collection = await mongoClient.db('XRPL').collection('xls20Nfts');
        const result = await collection.updateOne({ _id: ObjectId(_id) }, { $set: { ...data } });

        resObj.data = null;
        resObj.success = true;
        resObj.error = false;
        resObj.message = result.modifiedCount === 0 ? 'Nothing modified' : 'Success';
        response(resObj, res);
    } catch (error) {
        errorRes('Some error occured', resObj, res);
        console.log(error);
    }
};

module.exports = {
    update: updateNFTs,
};

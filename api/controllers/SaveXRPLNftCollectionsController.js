const mongoClient = Richlist.getDatastore().manager.client;
const { response } = require('./response');
const { validate } = require('./ValidateJwtController');

const errorRes = (errorMsg, resObj, res) => {
    resObj.data = null;
    resObj.success = false;
    resObj.error = true;
    resObj.message = errorMsg;
    response(resObj, res);
};

const saveXRPLNftCollection = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };

    try {
        await validate(req, res);
        const { body } = req;
        const { data } = body;

        if (!data || data.length === 0) {
            errorRes('Please check the data again', resObj, res);
            return;
        }

        for (i in data) {
            const record = data[i];
            const { issuerAddress, collectionName } = record;

            if (!(issuerAddress?.length > 0 && collectionName?.length > 0)) {
                errorRes(`Please check the parameters again`, resObj, res);
                return;
            }
        }

        const ecosystem = await mongoClient.db('XRPL').collection('xls20Nfts');
        await ecosystem.insertMany(data);

        resObj.data = null;
        resObj.success = true;
        resObj.error = false;
        resObj.message = 'Success';
        response(resObj, res);
    } catch (error) {
        errorRes('Some error occured', resObj, res);
        console.log(error);
    }
};

module.exports = {
    save: saveXRPLNftCollection,
};

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

const saveXRPLEcosystemEntry = async (req, res) => {
    const { body } = req;
    const { data } = body;

    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };

    try {
        await validate(req, res);

        if (!data || data.length === 0) {
            errorRes('Please check the data again', resObj, res);
            return;
        }

        for (i in data) {
            const record = data[i];
            const { projectName, websiteUrl, twitterUrl, live, isVisible, nickName, category } = record;

            if (!(projectName?.length > 0 && websiteUrl?.length > 0 && twitterUrl?.length > 0 && live?.length > 0 && isVisible?.length > 0 && nickName?.length > 0 && category?.length > 0)) {
                errorRes(`Please check the parameters again`, resObj, res);
                return;
            }
        }

        const ecosystem = await mongoClient.db('XRPL').collection('ecosystem');
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
    save: saveXRPLEcosystemEntry,
};

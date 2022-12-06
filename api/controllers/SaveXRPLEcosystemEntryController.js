const mongoClient = Richlist.getDatastore().manager.client;
const { response } = require('./response');

const errorRes = (errorMsg, resObj) => {
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
        if (!data || data.length == 0 || typeof data !== Array) {
            errorRes('Please check the data again', resObj);
            return;
        }

        for (i in data) {
            const record = data[i];
            const { name, website, twitter, live, otherDetails, isVisible, nickName, category } = record;

            if (!(name && website && twitter && live && otherDetails && isVisible && nickName && category)) {
                errorRes(`Please check the parameters again of record ${i + 1}`, resObj);
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
    } catch (error) {}
};

module.exports = {
    save: saveXRPLEcosystemEntry,
};

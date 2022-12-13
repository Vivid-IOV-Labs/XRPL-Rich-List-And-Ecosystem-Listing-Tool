const mongoClient = Richlist.getDatastore().manager.client;
const { response } = require('./response');

const errorRes = (errorMsg, resObj, res) => {
    resObj.data = null;
    resObj.success = false;
    resObj.error = true;
    resObj.message = errorMsg;
    response(resObj, res);
};

const saveXRPLIous = async (req, res) => {
    const { body } = req;
    const { data } = body;

    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };

    try {
        if (!data || data.length === 0 || typeof data !== Array) {
            errorRes('Please check the data again', resObj, res);
            return;
        }

        for (i in data) {
            const record = data[i];
            const { issuerAccount, projectName, shortDescription } = record;

            if (!(issuerAccount && projectName && shortDescription)) {
                errorRes(`Please check the parameters again of record ${i + 1}`, resObj, res);
                return;
            }
        }

        const ecosystem = await mongoClient.db('XRPL').collection('ious');
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
    save: saveXRPLIous,
};

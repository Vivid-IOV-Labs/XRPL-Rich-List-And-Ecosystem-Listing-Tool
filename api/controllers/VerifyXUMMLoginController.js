const mongoClient = Richlist.getDatastore().manager.client;
const { response } = require('./response');

const verifyXummLogin = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };
    try {
        const { query } = req;
        if (!(query && query.uuid)) {
            resObj.data = null;
            resObj.success = false;
            resObj.error = true;
            resObj.message = `Please provide 'uuid' in params`;
            response(resObj, res);
            return;
        }

        const options = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'X-API-Key': process.env.XUMM_API_KEY,
                'X-API-Secret': process.env.XUMM_API_SECRET,
            },
        };
        const {
            response: { account },
            meta: { signed },
        } = await fetch(`https://xumm.app/api/v1/platform/payload/${query.uuid}`, options).then((response) => response.json());

        if (!signed) {
            resObj.data = null;
            resObj.success = false;
            resObj.error = true;
            resObj.message = `User has not signed the payload`;
            response(resObj, res);
            return;
        }

        if (account) {
            const isAuthorized = await mongoClient.db('XRPL').collection('admin').find({ address: account }).toArray();
            if (isAuthorized.length > 0) {
                resObj.data = { address: account };
                resObj.success = true;
                resObj.error = false;
                resObj.message = `Success`;
                response(resObj, res);
                return;
            }
        }

        resObj.data = null;
        resObj.success = false;
        resObj.error = true;
        resObj.message = `Some error occured, Please try again`;
        response(resObj, res);
    } catch (err) {
        console.log(err);
        resObj.data = null;
        resObj.success = false;
        resObj.error = true;
        resObj.message = 'Internal Error';
        response(resObj, res);
    }
    return;
};

module.exports = {
    verifyXummLogin,
};

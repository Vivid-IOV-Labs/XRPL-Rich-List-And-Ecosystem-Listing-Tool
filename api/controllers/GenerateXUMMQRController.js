const { XummSdk } = require('xumm-sdk');
const { response } = require('./response');

const generateQR = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };
    try {
        const Sdk = new XummSdk(process.env.XUMM_API_KEY, process.env.XUMM_API_SECRET);
        const payload = await Sdk.payload.create({ TransactionType: 'SignIn' }, true);
        resObj.data = payload;
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
    generate: generateQR,
};

const { response } = require('./response');
const jwt = require('jsonwebtoken');
const mongoClient = Richlist.getDatastore().manager.client;

const validateJwt = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };

    try {
        const { body, query, headers } = req;
        const token = body?.token || query?.token || headers?.token;

        if (!token) {
            resObj.data = null;
            resObj.success = false;
            resObj.error = true;
            resObj.message = `Please provide 'authorization' token`;
            response(resObj, res);
            return;
        }
        console.log(token);
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        if (decoded) {
            const findAddress = await mongoClient.db('XRPL').collection('admin').find({ address: decoded.address }).toArray();
            if (findAddress.length > 0) {
                return;
            }
        }

        resObj.data = { success: false };
        resObj.success = true;
        resObj.error = false;
        resObj.message = `JWT validation failed`;

        response(resObj, res);
        return;
    } catch (err) {
        resObj.data = { success: false };
        resObj.success = true;
        resObj.error = false;
        resObj.message = `JWT validation failed`;
        response(resObj, res);
        console.log(err);
    }
};

module.exports = {
    validate: validateJwt,
};

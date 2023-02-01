const { response } = require('./response');
const jwt = require('jsonwebtoken');

const validateJwt = async (req, res, next) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };

    try {
        const { headers } = req;
        if (!headers || !headers.authorization) {
            resObj.data = null;
            resObj.success = false;
            resObj.error = true;
            resObj.message = `Please provide 'authorization' in headers`;
            response(resObj, res);
            return;
        }

        const decoded = jwt.verify(headers.authorization, process.env.TOKEN_KEY);

        if (decoded) {
            resObj.data = { success: true };
            resObj.success = true;
            resObj.error = false;
            resObj.message = `JWT validated successfully`;
        } else {
            resObj.data = { success: false };
            resObj.success = true;
            resObj.error = false;
            resObj.message = `JWT validation failed`;
        }

        response(resObj, res);
        return;
    } catch (err) {
        resObj.data = null;
        resObj.success = false;
        resObj.error = true;
        resObj.message = `Some error occured, Please try again`;
        response(resObj, res);
        console.log(err);
    }
};

module.exports = {
    validate: validateJwt,
};

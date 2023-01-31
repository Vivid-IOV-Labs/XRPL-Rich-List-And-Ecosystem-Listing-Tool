/**
 * ValidateJwtController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

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
            next(req, res);
            return;
        }
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

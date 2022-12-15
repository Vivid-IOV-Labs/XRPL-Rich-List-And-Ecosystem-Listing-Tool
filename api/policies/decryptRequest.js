const { AES, enc } = require('crypto-js');

module.exports = async function (req, res, next) {
    try {
        const { body } = req;

        if (!body || !body.encryptedRequest) {
            return res.ok({
                success: false,
                error: true,
                message: 'Please check the encryption key',
            });
        }

        const decryptedRes = AES.decrypt(body.encryptedRequest, process.env.ENCRYPTION_KEY);
        const str = decryptedRes.toString(enc.Utf8);

        if (!str) {
            return res.ok({
                success: false,
                error: true,
                message: 'Please check the request',
            });
        }

        req.body = JSON.parse(str);
        next();
    } catch (error) {
        res.ok({
            success: false,
            error: true,
            message: 'Some error occurred',
        });
        console.log(error);
    }
};

module.exports = async function (req, res, next) {
    try {
        const { body } = req;
        const { accessKey } = body;

        if (accessKey && accessKey === process.env.ACCESS_KEY) {
            return next();
        }

        res.ok({
            success: false,
            error: true,
            message: 'Please check the access key',
        });
        return;
    } catch (error) {
        res.ok({
            success: false,
            error: true,
            message: 'Some error occurred',
        });
        console.log(error);
    }
};

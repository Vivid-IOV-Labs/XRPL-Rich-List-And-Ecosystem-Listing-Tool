module.exports = async function (req, res, next) {
    try {
        const { body, headers, query } = req;
        const accessKey = body?.accessKey | headers?.accessKey | query?.accessKey;

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

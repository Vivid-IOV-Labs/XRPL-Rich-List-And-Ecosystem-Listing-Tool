const mongoClient = Richlist.getDatastore().manager.client;
const { response } = require('./response');

const fetchRichlist = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };
    try {
        const data = await mongoClient.db('Richlist').collection('percents').find().sort({ _id: -1 }).toArray();
        resObj.data = data[0] ? data[0] : null;
        resObj.success = true;
        resObj.error = false;
        resObj.message = 'Success';
        response(resObj, res);
    } catch (error) {
        resObj.success = false;
        resObj.error = true;
        resObj.message = 'Some error occured';
        console.error(error);
        response(resObj, res);
    }
};

const fetchRichlistPercentageData = async (req, res) => {
    const { percentage } = req.query; // percentage is an optional URL parameter
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: [],
    };

    try {
        // Fetch the most recent 10 documents, adjust this to your needs
        const data = await mongoClient.db('Richlist').collection('percents').find().sort({ _id: -1 }).limit(10).toArray();
        if (data.length) {
            const percentData = data.map((doc) => {
                const percentageData = doc.percents.map((percentObj) => {
                    return {
                        x: new Date(doc.ledgerCloseTime).getTime(),
                        y: percentObj.minBalance,
                        ...percentObj
                    };
                });
                return percentageData;
            });
            const flatPercentData = percentData.flat();
            if (percentage) {
                const filteredData = flatPercentData.filter(percentData => percentData.percentage === parseFloat(percentage));
                if (filteredData.length > 0) {
                    resObj.data = filteredData;
                } else {
                    throw new Error(`No data found for percentage ${percentage}`);
                }
            } else {
                resObj.data = flatPercentData;
            }
            resObj.success = true;
            resObj.error = false;
            resObj.message = 'Success';
        } else {
            throw new Error('No data found');
        }
        response(resObj, res);
    } catch (error) {
        resObj.success = false;
        resObj.error = true;
        resObj.message = 'Some error occured';
        console.error(error);
        response(resObj, res);
    }
};

module.exports = {
    fetch: fetchRichlist,
    fetchPercentageData: fetchRichlistPercentageData,
};

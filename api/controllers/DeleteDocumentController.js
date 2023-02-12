const mongoClient = Richlist.getDatastore().manager.client;
const { ObjectId } = require('mongodb');

const { response } = require('./response');
const { validate } = require('./ValidateJwtController');

const deleteADocument = async (req, res) => {
    const resObj = {
        success: false,
        error: false,
        message: '',
        data: {},
    };

    try {
        await validate(req, res);
        const { body } = req;
        const { collection, _id } = body;
        const collectionDB = await mongoClient.db('XRPL').collection(collection);
        const result = await collectionDB.deleteOne({ _id: ObjectId(_id) });

        if (result.deletedCount === 1) {
            resObj.data = null;
            resObj.success = true;
            resObj.error = false;
            resObj.message = 'success';
            response(resObj, res);
            return;
        }
        resObj.message = 'nothing got updated';
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
    delete: deleteADocument,
};

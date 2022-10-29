const mongoClient = Richlist.getDatastore().manager.client;

const response = async (_xresp, res) => {
  if (_xresp.error) {
    delete _xresp.error;
    sails.log.error(_xresp.message);
    return res.serverError(_xresp);
  } else if (_xresp.badRequest) {
    delete _xresp.badRequest;
    sails.log.info(_xresp.message);
    return res.badRequest(_xresp);
  }

  return res.ok(_xresp);
};

const fetchRichlist = async (req, res) => {
  const resObj = {
    success: false,
    error: false,
    message: '',
    data: {},
  };
  try {
    const data = await mongoClient.db('Richlist').collection('percents').find().toArray();
    delete data[0].accountsToCheckNfts;
    resObj.data = data[0];
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

module.exports = {
  fetch: fetchRichlist,
};

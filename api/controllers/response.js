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
exports.response = response;

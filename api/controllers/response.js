const response = async (_xresp, res) => {
    if (_xresp.error) {
        sails.log.error(_xresp.message);
        return res.ok(_xresp);
    }

    return res.ok(_xresp);
};
exports.response = response;

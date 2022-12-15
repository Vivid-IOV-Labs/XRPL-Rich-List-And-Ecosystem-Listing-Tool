module.exports.policies = {
    SaveXRPLEcosystemEntryController: {
        '*': ['decryptRequest', 'isAdmin'],
    },
    SaveXRPLIousController: {
        '*': ['decryptRequest', 'isAdmin'],
    },
    SaveXRPLNftCollectionsController: {
        '*': ['decryptRequest', 'isAdmin'],
    },
};

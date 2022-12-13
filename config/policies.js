module.exports.policies = {
    SaveXRPLEcosystemEntryController: {
        '*': 'isAdmin',
    },
    SaveXRPLIousController: {
        '*': 'isAdmin',
    },
    SaveXRPLNftCollectionsController: {
        '*': 'isAdmin',
    },
};

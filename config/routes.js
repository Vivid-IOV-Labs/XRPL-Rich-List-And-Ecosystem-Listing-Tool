module.exports.routes = {
    // Routes to fetch and display data

    // Richlist related stuff
    'GET /richlist': { controller: 'FetchRichlistController', action: 'fetch' },
    'GET /richlist/nfts': { controller: 'FetchNfTokenAnalyticsController', action: 'fetch' },
    'GET /richlist/account-nfts': { controller: 'FetchAccountNftsController', action: 'fetch' },

    // NFTs, Ecosystem and IOUs related stuff
    'GET /xrpl/ecosystem': { controller: 'FetchXrplEcosystemController', action: 'fetch' },
    'GET /xrpl/xls20Nfts/info': { controller: 'FetchXLS20NftsForPublicController', action: 'fetch' },
    'GET /xrpl/xls20Nfts': { controller: 'FetchXLS20NftCollectionsController', action: 'fetch' },
    'GET /xrpl/ious': { controller: 'FetchXRPLIOUCollectionsController', action: 'fetch' },

    // Routes to update data
    'GET /xrpl/ecosystem/update': { controller: 'UpdateXRPLEcosystemEntryController', action: 'update' },
    'GET /xrpl/xls20Nfts/update': { controller: 'UpdateXRPLNftCollectionsController', action: 'update' },
    'GET /xrpl/ious/update': { controller: 'UpdateXRPLIousController', action: 'update' },

    // Routes that save data in DB
    'POST /xrpl/ecosystem/save': { controller: 'SaveXRPLEcosystemEntryController', action: 'save' },
    'POST /xrpl/xls20Nfts/save': { controller: 'SaveXRPLNftCollectionsController', action: 'save' },
    'POST /xrpl/ious/save': { controller: 'SaveXRPLIousController', action: 'save' },

    // XUMM Related Routes
    'POST /xumm/login/verify': { controller: 'VerifyXUMMLoginController', action: 'verify' },
    'GET /xumm/qr/generate': { controller: 'GenerateXUMMQRController', action: 'generate' },
};

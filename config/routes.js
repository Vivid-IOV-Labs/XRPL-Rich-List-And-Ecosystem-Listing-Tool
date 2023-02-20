module.exports.routes = {
    // Routes to fetch and display data

    // Richlist related stuff
    'GET /richlist': { controller: 'FetchRichlistController', action: 'fetch' },
    'GET /richlist/nfts': { controller: 'FetchNfTokenAnalyticsController', action: 'fetch' },
    'GET /richlist/account-nfts': { controller: 'FetchAccountNftsController', action: 'fetch' },

    // NFTs, Ecosystem and IOUs related stuff
    'GET /xrpl/ecosystem': { controller: 'FetchXrplEcosystemController', action: 'fetch' },
    'GET /xrpl/xls20Nfts': { controller: 'FetchXLS20NftCollectionsController', action: 'fetch' },
    'GET /xrpl/ious': { controller: 'FetchXRPLIOUCollectionsController', action: 'fetch' },

    // For public
    'GET /xrpl/internal/ecosystem': { controller: 'FetchXrplEcosystemForPublicController', action: 'fetch' },
    'GET /xrpl/internal/xls20Nfts': { controller: 'FetchXrplXls20NftForPublicController', action: 'fetch' },
    'GET /xrpl/internal/ious': { controller: 'FetchXRPLIOUCollectionsForPublicController', action: 'fetch' },
    'GET /xrpl/xls20Nfts/info': { controller: 'FetchXLS20NftsForPublicController', action: 'fetch' },

    // Routes to delete values from DB
    'POST /xrpl/delete': { controller: 'DeleteDocumentController', action: 'delete' },

    // Routes to update data
    'POST /xrpl/ecosystem/update': { controller: 'UpdateXRPLEcosystemEntryController', action: 'update' },
    'POST /xrpl/xls20Nfts/update': { controller: 'UpdateXRPLNftCollectionsController', action: 'update' },
    'POST /xrpl/ious/update': { controller: 'UpdateXRPLIousController', action: 'update' },

    // Routes that save data in DB
    'POST /xrpl/ecosystem/save': { controller: 'SaveXRPLEcosystemEntryController', action: 'save' },
    'POST /xrpl/xls20Nfts/save': { controller: 'SaveXRPLNftCollectionsController', action: 'save' },
    'POST /xrpl/ious/save': { controller: 'SaveXRPLIousController', action: 'save' },

    // XUMM Related Routes
    'GET /xumm/login/verify': { controller: 'VerifyXUMMLoginController', action: 'verify' },
    'GET /xumm/qr/generate': { controller: 'GenerateXUMMQRController', action: 'generate' },

    // Route to validate JWT
    'POST /jwt/validate': { controller: 'ValidateJWTController', action: 'validate' },
};

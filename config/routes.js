/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` your home page.            *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/

    'GET /richlist': { controller: 'FetchRichlistController', action: 'fetch' },
    'GET /richlist/nfts': { controller: 'FetchNfTokenAnalyticsController', action: 'fetch' },
    'GET /richlist/account-nfts': { controller: 'FetchAccountNftsController', action: 'fetch' },
    'GET /xrpl/ecosystem': { controller: 'FetchXrplEcosystemController', action: 'fetch' },
    'GET /xrpl/xls20Nfts/info': { controller: 'FetchXLS20NftsForPublicController', action: 'fetch' },
    'GET /xrpl/xls20Nfts': { controller: 'FetchXLS20NftCollectionsController', action: 'fetch' },
    'GET /xrpl/ious': { controller: 'FetchXRPLIOUCollectionsController', action: 'fetch' },
    'GET /xumm/qr/generate': { controller: 'GenerateXUMMQRController', action: 'generate' },
    'POST /xrpl/ecosystem/save': { controller: 'SaveXRPLEcosystemEntryController', action: 'save' },
    'POST /xrpl/xls20Nfts/save': { controller: 'SaveXRPLNftCollectionsController', action: 'save' },
    'POST /xrpl/ious/save': { controller: 'SaveXRPLIousController', action: 'save' },
    'POST /xumm/login/verify': { controller: 'VerifyXUMMLoginController', action: 'verify' },
    /***************************************************************************
     *                                                                          *
     * More custom routes here...                                               *
     * (See https://sailsjs.com/config/routes for examples.)                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the routes in this file, it   *
     * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
     * not match any of those, it is matched against static assets.             *
     *                                                                          *
     ***************************************************************************/
};

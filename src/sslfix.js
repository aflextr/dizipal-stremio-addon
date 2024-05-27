const crypto = require("crypto");
const https = require("https");

//SSL ERROR FİX PROXY
const allowLegacyRenegotiationforNodeJsOptions = {
  httpsAgent: new https.Agent({
    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
  }),
};


module.exports = allowLegacyRenegotiationforNodeJsOptions;
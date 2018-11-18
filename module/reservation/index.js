const lib = require('./lib/reservation');
const { site, manage } = require('./route');
const middleware = require('./lib/middleware');

module.exports = lib;
module.exports.site = site;
module.exports.manage = manage;
module.exports.middleware = middleware;

const lib = require('./lib/administrator');
const { site, admin } = require('./route');
const middleware = require('./lib/middleware');

module.exports = lib;
module.exports.site = site;
module.exports.admin = admin;
module.exports.middleware = middleware;
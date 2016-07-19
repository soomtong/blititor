var lib = require('./lib/manager');
var route = require('./route');
var middleware = require('./lib/middleware');

module.exports = lib;
module.exports.route = route;
module.exports.middleware = middleware;
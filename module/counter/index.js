var lib = require('./lib/counter');
var route = require('./route');
var middleware = require('./lib/middleware');

module.exports = lib;
module.exports.route = route;
module.exports.middleware = middleware;
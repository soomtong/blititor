var lib = require('./lib/counter');
var middleware = require('./lib/middleware');

module.exports = lib;
module.exports.middleware = middleware;
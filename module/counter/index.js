const lib = require('./lib/counter');
const middleware = require('./lib/middleware');

module.exports = lib;
module.exports.middleware = middleware;
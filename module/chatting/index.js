const lib = require('./lib/chatting');
const route = require('./route');
const middleware = require('./lib/middleware');

module.exports = lib;
module.exports.route = route;
module.exports.middleware = middleware;

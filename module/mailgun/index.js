var middleware = require('./lib/middleware');
var mailgun = require('./lib/mailgun');

module.exports = mailgun;
module.exports.middleware = middleware;

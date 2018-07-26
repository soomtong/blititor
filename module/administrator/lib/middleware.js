var winston = require('winston');
var util = require('util');

function exposeLocals(req, res, next) {
    winston.verbose('bind locals in administrator: {}');
    next();
}

module.exports = {
    exposeLocals: exposeLocals
};
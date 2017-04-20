var winston = require('winston');

function exposeLocals(req, res, next) {
    winston.verbose('bind locals in controller_hub: {}');
    next();
}

module.exports = {
    exposeLocals: exposeLocals
};
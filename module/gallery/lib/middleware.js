var winston = require('winston');

function exposeLocals(req, res, next) {
    winston.verbose('bind locals in gallery: {}');
    
    next();
}

module.exports = {
    exposeLocals: exposeLocals
};
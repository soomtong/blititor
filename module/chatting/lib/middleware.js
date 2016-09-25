var winston = require('winston');

function exposeLocals(req, res, next) {
    next();
}

module.exports = {
    exposeLocals: exposeLocals
};
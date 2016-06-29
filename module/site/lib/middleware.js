var winston = require('winston');

function exposeLocals(req, res, next) {
    res.locals.user = req.user;
    res.locals.message = req.flash();

    winston.verbose('bind locals in site: {user, message}');
    next();
}

module.exports = {
    exposeLocals: exposeLocals
};
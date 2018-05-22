var winston = require('winston');

function exposeLocals(req, res, next) {
    res.locals.menu.manage_root = '/manage';

    winston.verbose('bind locals in manager: {manage_menu}');
    next();
}

module.exports = {
    exposeLocals: exposeLocals
};
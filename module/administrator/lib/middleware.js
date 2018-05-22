var winston = require('winston');

function exposeLocals(req, res, next) {
    res.locals.menu.admin_root = '/admin';

    winston.verbose('bind locals in administrator: {admin_menu}');
    next();
}

module.exports = {
    exposeLocals: exposeLocals
};
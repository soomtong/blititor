var misc = require('../lib/misc');
var routeTable = misc.routeTable();

function checkDatabaseConfig(req, res, next) {
    if (!BLITITOR.config.database) {
        res.redirect(routeTable['database_setup']);
    } else {
        next();
    }
}

function passDatabaseConfigCheck(req, res, next) {
    if (BLITITOR.config.database) {
        res.redirect(routeTable['root']);
    } else {
        next();
    }
}

module.exports = {
    databaseCheck: checkDatabaseConfig,
    bypassDatabase: passDatabaseConfigCheck
};
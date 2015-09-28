var misc = require('../lib/misc');
var routeTable = misc.routeTable();

function checkDatabaseConfig(req, res, next) {
    if (!BLITITOR.config.database) {
        res.redirect(routeTable.admin_root + routeTable.admin.database_setup);
    } else {
        next();
    }
}

module.exports = {
    databaseCheck: checkDatabaseConfig
};
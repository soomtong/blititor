var misc = require('../../lib/misc');
var routeTable = misc.routeTable();

// bind common parameters
function setupMiddleware(req, res, next) {
    var siteTheme = BLITITOR.config.site.theme;
    var siteThemeType = 'setup';

    res.locals.site = {
        theme: siteTheme,
        themeType: siteThemeType,
        title: BLITITOR.config.revision,
        url: routeTable.admin_root + req.path
    };
    res.locals.routeTable = routeTable;

    next();
}

function passDatabaseConfigCheck(req, res, next) {
    if (BLITITOR.config.database) {
        res.redirect(routeTable.root);
    } else {
        next();
    }
}


module.exports = {
    setupMiddleware: setupMiddleware,
    bypassDatabase: passDatabaseConfigCheck
};
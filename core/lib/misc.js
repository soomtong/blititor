var fs = require('fs');
var winston = require('winston');

var defaultRoute = {
    "root": "/",
    "admin_root": "/admin",
    "admin": {
        "login": "/login",
        "install": "/install",
        "database_setup": "/make-db-config",
        "database_init": "/make-db-init",
        "theme_setup": "/theme-config"
    },
    "account_root": "/account",
    "account": {
        "login": "/login",
        "register": "/register",
        "info": "/info",
        "updateInfo": "/update"
    },
    "guestbook_root": "/guest",
    "guestbook": {
        "form": "/",
        "register": "/register"
    },
    "pages": []
};

var databaseTables = {
    user: 'b_user',
    auth: 'b_auth',
    site: 'b_site',
    point: 'b_point',
    guestbook: 'b_guestbook',
};

function routeTable() {
    BLITITOR.route = defaultRoute;

    return BLITITOR.route;
}

function databaseTable() {
    return databaseTables;
}

/*
function setRoutePage() {
    var theme = BLITITOR.config.site.theme;
    BLITITOR.route = defaultRoute;

    //read theme page folder and merge default route
    //todo: this method will be removed
    try {
        var files = fs.readdirSync('./theme/' + theme + '/page');

        winston.verbose('pages in page folder', files);

        BLITITOR.route.pages = files.filter(function (file) {
            return file.indexOf('.html') && file.indexOf('_') !== 0 && file.indexOf('include') == -1
        }).map(function (file) {
            return file.replace('.html', '');
        });

    } catch (e) {
        winston.error('Default theme is not exist');
    }
}
*/

function siteThemeType() {
    return {
        setup: 'setup',
        admin: 'admin',
        manage: 'manage'
    };
}

function showRouteTable(routeTable) {
    winston.info("\x1B[32m=== load default route table ===\033[0m");

    winston.verbose(JSON.stringify(routeTable, null, 4));
/*
    var margin = 30;

    for (var item in routeTable) {
        if (routeTable.hasOwnProperty(item)) {      // for lint
            var pad = (new Array(margin - item.toString().length)).join(' ');
            var tempString = item.toString() + pad;

            console.log(' - ' + tempString + routeTable[item]);
        }
    }
*/
}

module.exports = {
    routeTable: routeTable,
    databaseTable: databaseTable,
    // setRoutePage: setRoutePage,
    siteThemeType: siteThemeType,
    showRouteTable: showRouteTable
};
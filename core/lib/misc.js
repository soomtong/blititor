var fs = require('fs');
var path = require('path');
var winston = require('winston');
var colors = require('colors');

var displayRoutes = require('express-routemap');
var printRoutes = require('express-print-routes');

var siteDefault = require('../config/site_default.json');
var userPrivilege = require('../config/user_level.json');
var defaultRoute = require('../config/route_default.json');

var serviceTokens = loadServiceToken();
var serviceProviders = loadServiceProvider();

function loadServiceToken() {
    var tokens;

    try {
        tokens = require('../../config.json').service.token;
    } catch (e) {
        winston.error("Can't Get Service Provider Token in `config.json`");
    }

    return tokens || {};
}

function loadServiceProvider() {
    var providers;

    try {
        providers = require('../../config.json').service.provider;
    } catch (e) {
        winston.error("Can't Get Service Provider Token in `config.json`");
    }

    return providers || {};
}

function getUserPrivilege() {
    // return userPrivilege;
    // for code assist
    return {
        "siteAdmin": "A",
        "siteManager": "M",
        "contentManager": "C",
        "userLevel_1": "1",
        "userLevel_2": "2",
        "userLevel_3": "3",
        "userLevel_4": "4",
        "userLevel_5": "5",
        "userLevel_6": "6",
        "userLevel_7": "7",
        "userLevel_8": "8",
        "userLevel_9": "9"
    };
}

function setUserPrivilege() {
    BLITITOR.userPrivilege = userPrivilege;

    return BLITITOR.userPrivilege;
}

function getRouteTable() {
    // return defaultRoute;
    // for code assist
    return {
        "root": "/",
        "about": "/about",
        "admin_root": "/admin",
        "admin": {
            "login": "/login",
            "install": "/install",
            "database_setup": "/make-db-config",
            "database_init": "/make-db-init",
            "theme_setup": "/theme-config",
            "account": "/account",
            "accountEdit": "/account/edit",
            "accountNew": "/account/register",
            "accountAdd": "/account/add",
            "counter": "/counter"
        },
        "manage_root": "/manage",
        "manage": {
            "login": "/login",
            "account": "/account",
            "reservation": "/reservation",
            "reservationClean": "/reservation/clean",
            "tutorial": "/reservation/tutorial",
            "tutorialStatus": "/reservation/tutorial/status",
            "gallery": "/gallery",
            "galleryCategory": "/gallery/category",
            "galleryImage": "/gallery/image",
            "galleryImageSort": "/gallery/image/sort",
            "galleryImageRemove": "/gallery/image/remove",
            "pageLog": "/page/log",
            "pageView": "/page",
            "pageCounter": "/counter/page",
            "accountCounter": "/counter/account"
        },
        "account_root": "/account",
        "account": {
            "signIn": "/sign-in",
            "signUp": "/sign-up",
            "signOut": "/sign-out",
            "checkToken": "/check-token",
            "login": "/login",
            "register": "/register",
            "registerSimple": "/register-simple",
            "add": "/add",
            "info": "/info",
            "updateInfo": "/update"
        },
        "reservation_root": "/reservation",
        "reservation": {
            "form": "/",
            "status": "/status",
            "phoneSecret": "/secret"
        },
        "guestbook_root": "/guestbook",
        "guestbook": {
            "form": "/",
            "message": "/register",
            "reply": "/register/reply"
        },
        "chatting_root": "/chat",
        "chat": {
            "form": ""
        },
        "gallery_root": "/gallery",
        "gallery": {
            "list": "/",
            "image": "/image",
            "upload": "/upload"
        },
        "teamblog_root": "/blog",
        "teamblog": {
            "list": "/",
            "write": "/write"
        },
        "teamblog_post": "/post",
        "teamblog_tag": {
            "list": "/tag"
        }
    };
}

function setRouteTable() {
    BLITITOR.route = defaultRoute;

    return BLITITOR.route;
}

// deprecated
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

function siteThemeType() {
    return {
        setup: 'setup',
        admin: 'admin',
        manage: 'manage'
    };
}

function commonToken() {
    return {
        session: {
            init: {id: 'session_init', value: 1000}
        },
        account: {
            login: {id: 'sign_in', value: 1001},
            logout: {id: 'sign_out', value: 1010},
            join: {id: 'sign_up', value: 1011}
        }
    }
}

function commonFlag() {
    return {
        post: {
            pinned: {id: 'pinned_post', value: 1},
            delta: {id: 'delta_post', value: 'D'},  // dalta format from `quill.js` editor
            markdown: {id: 'markdown_post', value: 'M'},
            asciidoc: {id: 'asciidoc_post', value: 'A'},
            headedPicture: {id: 'picture_headed_post', value: 'H'}
        }
    }
}

function setFlag(flag) {
    var flagList = commonFlag();

    switch (flag) {
        case flagList.post.markdown.value:
            return flagList.post.markdown.value;
            break;
        case flagList.post.delta.value:
            return flagList.post.delta.value;
            break;
        default:
            return '';
    }
}

function showRouteTable() {
    winston.info("\x1B[32mload default route table \033[0m");

    winston.verbose(JSON.stringify(defaultRoute, null, 4));
}

function showGlobalVar(g) {
    Object.keys(g).forEach(function (item) {
        if (item.toString().indexOf('_') !== 0) {
            winston.verbose('Saving var info of global', item, 'to log folder');
            fs.writeFile(path.join(__dirname, '..', 'log', 'global-var-' + item + '.log'), JSON.stringify(g[item], null, 4));
        }
    });
}

function showRoutes(app) {
    printRoutes(app, path.join(__dirname, '..', 'log/site-routes.log'));
    displayRoutes(app);
}

function checkDatabaseConfigFile(configFile) {
    var databaseSetting = {};

    try {
        fs.accessSync(configFile, fs.R_OK);

        databaseSetting = require(path.join('../..', configFile))['database'];

        BLITITOR.config.database = databaseSetting;

        winston.info('database config information in that file is loaded');
    } catch (e) {
        winston.error('database config information in that file is not exist');
        console.error('----------------------------------------------------------------------------'.bgRed);
        console.error(' Go to make `node core/setup db` and create database connection information '.bgRed);
        console.error('----------------------------------------------------------------------------'.bgRed);

        process.exit(1);
    }
}

function checkThemeConfigFile(configFile) {
    var config = {};
    var appSetting = {};
    var themeSetting = {};

    try {
        fs.accessSync(configFile, fs.R_OK);

        config = require(path.join('../..', configFile));

        appSetting = config['application'];
        themeSetting = config['theme'];

        fs.accessSync('./app/' + appSetting.appName, fs.R_OK);
        fs.accessSync('./theme/' + themeSetting.siteTheme, fs.R_OK);
    } catch (e) {
        winston.error('theme folder or config file not exist', e);

        appSetting = {
            "port": siteDefault.port,
            "appName": siteDefault.theme,
            "url_prefix": siteDefault.url_prefix,
            "title": siteDefault.title
        };
        themeSetting = {
            "siteTheme": siteDefault.theme,
            "adminTheme": siteDefault.theme,
            "manageTheme": siteDefault.theme
        };

        config['application'] = appSetting;
        config['theme'] = themeSetting;

        fs.writeFileSync(configFile, JSON.stringify(config, null, 4));

        winston.error('added app and theme information to config.json');

    } finally {
        // bind some vars to global, u can check this parameters in `core/log/global-var-config.log`
        BLITITOR.config.site = {
            "service": {
                "port": appSetting.port,
                "url_prefix": appSetting.url_prefix
            },
            "app": appSetting.appName,
            "title": appSetting.title,
            "theme": themeSetting.siteTheme,
            "adminTheme": themeSetting.adminTheme,
            "manageTheme": themeSetting.manageTheme
        };

        winston.info("Set site app to '" + BLITITOR.config.site.app + "'");
        winston.info("Set site theme to '" + BLITITOR.config.site.theme + "'");
        winston.info("Set site admin theme to '" + BLITITOR.config.site.adminTheme + "'");
        winston.info("Set site manage theme to '" + BLITITOR.config.site.manageTheme + "'");
    }
}

function serviceToken(vendor) {
    var token;

    token = serviceTokens[vendor];

    if (!token) winston.error("No exist '" + vendor + "' token information");

    return token || "";
}

function serviceProvider(vendor) {
    var provider;

    provider = serviceProviders[vendor];

    if (!provider) winston.error("No exist '" + vendor + "' provider information");

    return provider || "";
}

module.exports = {
    getUserPrivilege: getUserPrivilege,
    setUserPrivilege: setUserPrivilege,
    getRouteTable: getRouteTable,
    setRouteTable: setRouteTable,
    setRoutePage: setRoutePage,
    siteThemeType: siteThemeType,
    commonFlag: commonFlag,
    setFlag: setFlag,
    commonToken: commonToken,
    serviceToken: serviceToken,
    serviceProvider: serviceProvider,
    showRouteTable: showRouteTable,
    showGlobalVar: showGlobalVar,
    showRoutes: showRoutes,
    checkDatabaseConfiguration: checkDatabaseConfigFile,
    checkThemeConfiguration: checkThemeConfigFile,
};
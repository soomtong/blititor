var fs = require('fs');
var path = require('path');
var async = require('neo-async');
var winston = require('winston');
var colors = require('colors');

var displayRoutes = require('express-routemap');
var printRoutes = require('express-print-routes');

var siteDefault = require('../config/site_default.json');
var userPrivilege = require('../config/user_level.json');

var serviceTokens = loadServiceToken();
var serviceProviders = loadServiceProvider();

function loadServiceToken() {
    var tokens;

    try {
        tokens = require('../../config.json').service.token;
    } catch (e) {
        winston.warn("Can't Get Service Token in `config.json`");
    }

    return tokens || {};
}

function loadServiceProvider() {
    var providers;

    try {
        providers = require('../../config.json').service.provider;
    } catch (e) {
        winston.warn("Can't Get Service Provider in `config.json`");
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

function getRouteTable(customRouteData) {
    if (customRouteData && !Array.isArray(customRouteData)) {
        if (Array.isArray(customRouteData)) {
            customRouteData.map(function (item) {
                Object.assign(BLITITOR.route, item);
            })
        } else {
            Object.assign(BLITITOR.route, customRouteData);
        }
    }

    return BLITITOR.route;
}

function setRouteTable(configData) {
    configData.map(function (item) {
        var routeFile = '/route.json';
        var routeData;

        try {
            routeData = fs.readFileSync(BLITITOR.root + '/module/' + item.folder + routeFile);

            winston.info('bound module route data:', "'" + item.folder + "'");
            Object.assign(BLITITOR.route, JSON.parse(routeData.toString()));
        } catch (e) {
            winston.verbose('there is no route data:', "'" + item.folder + "'");
        }
    });
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
        },
        appStore: {
            pinned: {id: 'pinned_netapp', value: 1},
            headedPicture: {id: 'picture_headed_netapp', value: 'H'},
            ordered: 0,
            installed: 1,
            removed: 2,
            canceled: 3
        },
        controllerHub: {
            gatewayGroup: {
                normal: 0,
                noticed: 1,
                urgent: 2,
                critical: 3
            }
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

    winston.verbose(JSON.stringify(BLITITOR.route, null, 4));
}

function showGlobalVar(g) {
    Object.keys(g).forEach(function (item) {
        if (item.toString().indexOf('_') !== 0) {
            winston.verbose('Saving var info of global', item, 'to log folder');
            fs.writeFile(path.join(__dirname, '..', 'log', 'global-var-' + item + '.log'), JSON.stringify(g[item], null, 4), function (err, result) {
                if (err) winston.error(err, result);
            });
        }
    });
}

function showRoutes(app) {
    printRoutes(app, path.join(__dirname, '..', 'log/site-routes.log'));
    displayRoutes(app, path.join(__dirname, '..', 'log/site-route-table.log'));
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

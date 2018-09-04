const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const async = require('neo-async');
const winston = require('winston');

const displayRoutes = require('express-routemap');
const printRoutes = require('express-print-routes');

const configFile = require('../config/app_default.json').configFile;
const siteDefault = require('../config/site_default.json');
const userPrivilege = require('../config/user_level.json');
const configuration = require(path.join('..', '..', configFile));
const databaseConfiguration = configuration['database'];

const serviceInformation = loadServiceInformation();

function loadServiceInformation() {
    let info;

    try {
        info = configuration.service;
    } catch (e) {
        winston.warn("Can't Get Service Token in `config.json`");
    }

    return info || {};
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

function getDatabaseDefaultData() {
    if (databaseConfiguration.tablePrefix) {
        const trimmer = '_';
        const last = databaseConfiguration.tablePrefix.length - 1;

        if (databaseConfiguration.tablePrefix[last] !== trimmer) {
            databaseConfiguration.tablePrefix += trimmer;
        }
    }

    return databaseConfiguration;
}

function setUserPrivilege() {
    BLITITOR.userPrivilege = userPrivilege;

    return BLITITOR.userPrivilege;
}

function getRouteData(customRouteData) {
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
        const routeFile = '/route.json';
        let routeData;

        try {
            routeData = fs.readFileSync(BLITITOR.root + '/module/' + item.folder + routeFile);

            winston.info("set module route data: '" + item.folder + "'");
            Object.assign(BLITITOR.route, JSON.parse(routeData.toString()));    // it perform better than spread operator.
            // BLITITOR.route = {...BLITITOR.route, ...JSON.parse(routeData.toString())};   // but u can simply use like it.
        } catch (e) {
            winston.verbose("there is no route data: '" + item.folder + "'");
        }
    });
}

function getPageName(menu, page_id, subPath) {
    for (let i = 0; i < menu.length; i++) {
        if (subPath) {
            if (menu[i].url == page_id) {
                return menu[i].name;
            }
        } else {
            if (menu[i].id == page_id) {
                return menu[i].name;
            }
        }
    }
}

function siteThemeType() {
    return {
        setup: 'setup',
        admin: 'admin',
        manage: 'manage'
    };
}

function vendorMap(vendorName) {
    const map = {
        flowjs: 'node_modules/@flowjs/flow.js/dist',
        jquery: 'node_modules/jquery/dist',
        bulma: 'node_modules/bulma/css',
        'bulma-ext': 'node_modules/bulma-extensions/dist',
        fontawesome: 'node_modules/font-awesome',
        bootstrap: 'node_modules/bootstrap/dist',
        pure: 'node_modules/purecss/build'
    };

    if (map[vendorName]) {
        return map[vendorName] || '/theme';
    } else {
        winston.error('no exist static library:', "'" + vendorName + "'");

        throw Error(vendorName + ' package is not installed')
    }
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
    const flagList = commonFlag();
    let flagCode = '';

    switch (flag) {
        case flagList.post.markdown.value:
            flagCode = flagList.post.markdown.value;
            break;
        case flagList.post.delta.value:
            flagCode = flagList.post.delta.value;
            break;
        default:
    }

    return flagCode;
}

function showGlobalVar(g) {
    Object.keys(g).forEach(function (item) {
        if (item.toString().indexOf('_') !== 0) {
            winston.verbose('Saving var info of global.' + item + ' to log folder');
            fs.writeFile(path.join(__dirname, '..', 'log', 'global-var-' + item + '.log'),
                JSON.stringify(g[item], null, 4),
                function (err, result) {
                    if (err) winston.error(`Saving global variables ${err}: ${result}`);
                });
        }
    });
}

function showRoutes(app) {
    printRoutes(app, path.join(__dirname, '..', 'log/site-routes.log'));
    displayRoutes(app, path.join(__dirname, '..', 'log/site-route-table.log'));
}

function checkDatabaseConfigFile(configFile) {
    let databaseSetting = {};

    try {
        fs.accessSync(configFile, fs.R_OK);

        databaseSetting = require(path.join('../..', configFile))['database'];

        BLITITOR.config.database = databaseSetting;

        winston.info('database config information in that file is loaded');
    } catch (e) {
        winston.error('database config information in that file is not exist');
        console.error('----------------------------------------------------------------------------');
        console.error(' Go to make `node core/setup db` and create database connection information ');
        console.error('----------------------------------------------------------------------------');

        process.exit(1);
    }
}

function checkThemeConfigFile(configFile) {
    let config = {};
    let appSetting = {};
    let themeSetting = {};

    try {
        fs.accessSync(configFile, fs.R_OK);

        config = require(path.join('../..', configFile));

        appSetting = config['application'];
        themeSetting = config['theme'];

        fs.accessSync('./app/' + appSetting.appName, fs.R_OK);
        fs.accessSync('./theme/' + themeSetting.siteTheme, fs.R_OK);
    } catch (e) {
        winston.error('=====================================', e);
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
        BLITITOR.site = {
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

        winston.info("Set site app to '" + BLITITOR.site.app + "'");
        winston.info("Set site theme to '" + BLITITOR.site.theme + "'");
        winston.info("Set site admin theme to '" + BLITITOR.site.adminTheme + "'");
        winston.info("Set site manage theme to '" + BLITITOR.site.manageTheme + "'");
    }
}

function serviceToken(vendor) {
    let token;

    token = serviceInformation[vendor] && serviceInformation[vendor].token;

    if (!token) winston.error("No exist '" + vendor + "' token information");

    return token || "";
}

function serviceProvider(vendor) {
    let provider;

    provider = serviceInformation[vendor] && serviceInformation[vendor].provider;

    if (!provider) winston.error("No exist '" + vendor + "' provider information");

    return provider || "";
}

function makeGalleryFolders(folder) {
    Object.keys(folder).map(value => {
        mkdirp.sync(folder[value]);
    });
    /*  ES2017
    Object.values(folder).map(value => {
        mkdirp.sync(value)
    });
    */
}

module.exports = {
    getUserPrivilege: getUserPrivilege,
    setUserPrivilege: setUserPrivilege,
    getRouteData: getRouteData,
    setRouteTable: setRouteTable,
    siteThemeType: siteThemeType,
    getPageName: getPageName,
    commonFlag: commonFlag,
    vendorMap: vendorMap,
    setFlag: setFlag,
    commonToken: commonToken,
    serviceToken: serviceToken,
    serviceProvider: serviceProvider,
    showGlobalVar: showGlobalVar,
    showRoutes: showRoutes,
    checkDatabaseConfiguration: checkDatabaseConfigFile,
    checkThemeConfiguration: checkThemeConfigFile,
    getDatabaseDefault: getDatabaseDefaultData,
    makeGalleryFolders: makeGalleryFolders
};

var fs = require('fs');
var winston = require('winston');

var userPrivilege = require('../config/user_level.json');
var defaultRoute = require('../config/route_default.json');

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
            "counter": "/counter"
        },
        "manage_root": "/manage",
        "manage": {
            "login": "/login",
            "account": "/account",
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
            "info": "/info",
            "updateInfo": "/update"
        },
        "guestbook_root": "/guestbook",
        "guestbook": {
            "form": "/",
            "message": "/register",
            "reply": "/register/reply"
        },
        "chatting_root": "/chatting",
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
            markdown: {id: 'markdown_post', value: 'M'},
            asciidoc: {id: 'asciidoc_post', value: 'D'},
            headedPicture: {id: 'picture_headed_post', value: 'H'}
        }
    }
}

function showRouteTable() {
    winston.info("\x1B[32mload default route table \033[0m");

    winston.verbose(JSON.stringify(defaultRoute, null, 4));
}

module.exports = {
    getUserPrivilege: getUserPrivilege,
    setUserPrivilege: setUserPrivilege,
    getRouteTable: getRouteTable,
    setRouteTable: setRouteTable,
    setRoutePage: setRoutePage,
    siteThemeType: siteThemeType,
    commonFlag: commonFlag,
    commonToken: commonToken,
    showRouteTable: showRouteTable
};
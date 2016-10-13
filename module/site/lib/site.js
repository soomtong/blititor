var winston = require('winston');
var common = require('../../../core/lib/common');

var filter = common.regexFilter();

function plainPage(req, res) {

    var params = {
        title: "Plain",
        path: req.path,
        page: req.path == '/' ? 'index' : req.path.match(filter.page)[1].replace(/-/g, '_'),
    };

    //500 Error
    //throw Error('make noise!');

    // winston.info(req.path, params, req.path.match(filter.page));

    res.render(BLITITOR.config.site.theme + '/page/' + params.page, params);
}

function plainPageWithSubPath(req, res) {

    var params = {
        title: "Plain",
        path: req.path,
        page: req.path.lastIndexOf('/') == req.path.toString().length - 1 ? req.path.replace(/-/g, '_') + 'index' : req.path.replace(/-/g, '_'),
    };

    winston.info(req.path, params, req.path.match(filter.page));
    console.log(req.path.lastIndexOf('/'), req.path.toString().length  -1 );
    console.log(params.page);

    res.render(BLITITOR.config.site.theme + '/page/' + params.page, params);
}

function bindMenuToRouter(menu, router) {
    menu.map(function (item) {
        if (!item.useSubPath) item.useSubPath = false;
        router[item['type'] || 'get'](item['url'], !item.useSubPath ? plainPage : plainPageWithSubPath);
    });
}

function redirectPage(url) {
    return function (req, res) {
        winston.warn('redirect to', url || 'back');
        if (url) {
            res.redirect(url);
        } else {
            res.redirect('back');
        }
    };
}

function exposeAppLocals(locals, menu) {
    return function (req, res, next) {
        res.locals.app = locals;
        res.locals.menu = menu;
        res.locals.adminMenu = menu.AdminMenu || {};
        res.locals.managerMenu = menu.ManagerMenu || {};

        winston.verbose('bind locals in app: {app, menu}');
        next();
    }
}

module.exports = {
    redirect: redirectPage,
    bindMenu: bindMenuToRouter,
    exposeAppLocals: exposeAppLocals,
};

var util = require('util');
var winston = require('winston');
var misc = require('../../../core/lib/misc');
var common = require('../../../core/lib/common');

var filter = common.regexFilter();

function plainPage(req, res) {

    var params = {
        path: req.path,
        page_id: req.path === '/' ? 'index' : req.path.match(filter.page)[1].replace(/-/g, '_'),
    };

    params.title = misc.getPageName(res.locals.siteMenu, params.page_id);

    //500 Error
    //throw Error('make noise!');

    // winston.info(req.path, params, req.path.match(filter.page));

    res.render(BLITITOR.config.site.theme + '/page/' + params.page_id, params);
}

function plainPageWithSubPath(req, res) {

    var params = {
        path: req.path,
        page_id: req.path.lastIndexOf('/') === req.path.toString().length - 1 ? req.path.replace(/-/g, '_') + 'index' : req.path.replace(/-/g, '_'),
    };

    params.title = misc.getPageName(res.locals.siteMenu, params.page_id, true);

    // winston.info(req.path, params, req.path.match(filter.page));
    // console.log(req.path.lastIndexOf('/'), req.path.toString().length  -1 );
    // console.log(params.page_id);

    res.render(BLITITOR.config.site.theme + '/page' + params.page_id, params);
}

function bindSiteMenuToRouter(menu, router) {
    menu.SiteMenu.map(function (item) {
        winston.verbose('Bound static menu:' + util.inspect(item));
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
        res.locals.siteMenu = menu.SiteMenu || {};
        //todo: Menu object by menu array
        // res.locals.Menu = misc.makeMenuObject(menu) to object
        res.locals.adminMenu = menu.AdminMenu || {};
        res.locals.manageMenu = menu.ManageMenu || {};

        winston.verbose('bind locals in app: {app, menu}');
        next();
    }
}

module.exports = {
    redirect: redirectPage,
    bindMenu: bindSiteMenuToRouter,
    exposeAppLocals: exposeAppLocals,
};

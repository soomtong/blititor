var express = require('express');
var winston = require('winston');

var router = express.Router();

var middleware = require('./middleware');
var themePackage = require('../module/' + BLITITOR.config.site.theme);

// passport config
var Account = require('../module/account');

router.use(middleware.exposeParameter);
router.use(themePackage.menu.expose);

// route for each modules
var routeList = themePackage.menu.data();

routeList.map(function (item) {
    // expose middleware for each
    if (item.middleware.length) {
        var m = item.middleware;
        m.map(function (item) {
            if (item) router.use(middleware[item]);
        });
    }

    winston.verbose(item);

    router[item.type](item.url, themePackage.page[item.page]);
});

router.use(Account.route);

module.exports = router;
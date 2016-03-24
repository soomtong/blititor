var express = require('express');

var middleware = require('./middleware');
var themePackage = require('../module/' + BLITITOR.config.site.theme);

var router = express.Router();
var routeList = themePackage.menu.data();

router.use(middleware.exposeParameter);
router.use(themePackage.menu.expose);

routeList.map(function (item) {
    // expose middleware for each
    if (item.middleware.length) {
        var m = item.middleware;
        m.map(function (item) {
            if (item) router.use(middleware[item]);
        });
    }

    router[item.type](item.url, themePackage.page[item.page]);
});

module.exports = router;
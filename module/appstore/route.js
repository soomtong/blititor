var express = require('express');

var misc = require('../../core/lib/misc');

var site = require('../site');

var appstore = require('./lib/appstore');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeData = require('./route.json');
var routeTable = misc.getRouteTable(routeData);

router.use(middleware.exposeLocals);

// bind module router
router.all(routeTable.root, site.redirect(routeTable.appstore_root));
router.get(routeTable.appstore_root, appstore.index);

router.get(routeTable.appstore_post + '/:postNumber([0-9]+)', appstore.view);
router.get(routeTable.appstore_post + '/:postTitle', appstore.view);

router.get(routeTable.appstore_root + routeTable.appstore.write, AccountMiddleware.checkSignedIn, appstore.write); // in order to avoid conflict with `:page` params
router.post(routeTable.appstore_root + routeTable.appstore.write, AccountMiddleware.checkSignedIn, appstore.save);

router.get(routeTable.appstore_root + routeTable.appstore.list, appstore.list);
router.get(routeTable.appstore_root + routeTable.appstore.list + ':page([0-9]+)', appstore.list);
router.get(routeTable.appstore_root + routeTable.appstore.list + ':year([0-9]+)/:month([0-9]+)', appstore.list);
router.get(routeTable.appstore_root + routeTable.appstore_tag.list + '/:tag' , appstore.list);

module.exports = router;

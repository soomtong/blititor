var express = require('express');
var winston = require('winston');

// var misc = require('./lib/misc');
var middleware = require('./middleware');

var application = require('../app/' + BLITITOR.config.site.app);

var router = express.Router();
// var routeTable = misc.getRouteTable();

// bind admin(manager) route
// router.use(routeTable.admin_root, adminRoute);

// Global middleware
router.use(middleware.exposeLocals);
router.use(middleware.checkDatabase);

// route for application
// router.use(application.exposeMenu);     // moved to own app's router
router.use(application.route);

// Extension
if (BLITITOR.env == 'development') { // Only in dev environment
    var statusMonitor = require('express-status-monitor');

    router.use(statusMonitor({path: '/system/status'}));
}

// Handle 404
router.use(function _404Handler(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('../theme/' + BLITITOR.config.site.theme + '/page/_404', { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

// Handle 500
router.use(function _500Handler(err, req, res, next){
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().
    winston.error(err);
    res.status(err.status || 500);
    res.render('../theme/' + BLITITOR.config.site.theme + '/page/_500', { error: err });
});

module.exports = router;
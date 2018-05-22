var fs = require('fs');
var path = require('path');

var express = require('express');
var winston = require('winston');

var misc = require('./lib/misc');
var middleware = require('./middleware');
var application = require('../app/' + BLITITOR.config.site.app);
var site = require('../module/site');
var admin = require('../module/administrator');
var manage = require('../module/manager');
var counter = require('../module/counter');

// extend router
var router = express.Router();

// Global middleware or locals
router.use(middleware.exposeLocals);
router.use(middleware.cacheControl);    // for global use
router.use(middleware.checkDatabase);
router.use(application.exposeLocals);
router.use(site.middleware.exposeLocals);

// route for admin or manage
if (application.config && application.config['admin']) {
    router.use('/admin', admin.middleware.exposeLocals, admin.route);
    winston.info('bound global administrator module to', '/admin');
}
if (application.config && application.config['manage']) {
    router.use('/manage', manage.middleware.exposeLocals, manage.route);
    winston.info('bound global manager module to', '/manage');
}

// need to place down here for excluding admin/manage page log
router.use(counter.middleware.sessionCounter);
router.use(counter.middleware.pageCounter);

// route for application
router.use(application.router);

if (application.config && application.config['vendor']) {
    application.config.vendor.map(function (vendor) {
        winston.info('bound static library:', "'" + vendor + "'");

        router.use('/vendor/' + vendor, express.static(misc.vendorMap(vendor)));
    });
}

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

    // set default 500 page
    fs.stat(path.join('..', 'theme', BLITITOR.config.site.theme, 'page', '_500.html'), function (error, stat) {
        if (error) {
            res.render('status500', { error: err });
        } else {
            res.render('../theme/' + BLITITOR.config.site.theme + '/page/_500', { error: err });
        }
    });
});

module.exports = router;
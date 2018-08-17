const winston = require('winston');

function exposeLocals(req, res, next) {
    // res.locals.user = req.user;
    res.locals.message = req.flash();

    winston.verbose('bind locals in site: {message}');
    next();
}

function cacheControl(req, res, next) {
    if (!BLITITOR.config['cacheControl']) {     // to distinguish by global middleware
        res.set({
            'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
            'Pragma': 'no-cache'
        });
    }

    next();
}

module.exports = {
    exposeLocals: exposeLocals,
    cacheControl: cacheControl,
};
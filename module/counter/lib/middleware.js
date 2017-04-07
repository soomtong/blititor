var winston = require('winston');
var useragent = require('useragent');

var misc = require('../../../core/lib/misc');

var counter = require('./counter');

var token = misc.commonToken();

function exposeMenu(req, res, next) {

    next();
}

function exposeLocals(req, res, next) {
    winston.verbose('bind locals in counter: {}');

    next();
}

function pageCounter(req, res, next) {
    var url = req.originalUrl;
    var method = req.method;
    var ip = (req.ip === '::1' || req.ip.startsWith('::ffff:')) ? '127.0.0.1' : req.ip;
    var ref = req.headers.referrer || req.headers.referer;
    var agent = useragent.parse(req.headers['user-agent']);
    var device = req.device;

    counter.insertPageCounter(url, method, ip, ref, agent, device);

    winston.verbose('logged counter in counter: {page} with', ip, ref || '');

    next();
}

function sessionCounter(req, res, next) {
    counter.session(req.sessionID, function (error, result) {
        if (!error && result) {
            var uuid;
            if (req.session['passport'] && req.session['passport'].user) uuid = req.session['passport'].user;

            counter.insertSessionLog(req['sessionID'], uuid);
            counter.insertSessionCounter(token.session.init);
        }
    });

    next();
}

module.exports = {
    exposeMenu: exposeMenu,
    exposeLocals: exposeLocals,
    pageCounter: pageCounter,
    sessionCounter: sessionCounter
};
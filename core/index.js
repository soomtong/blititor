// global bind
var BLITITOR = {
    env: process.env['NODE_ENV'] || 'development',
    root: __dirname + '/../',
    config: {
        site: {
            theme: 'simplestrap',
            host: '',
            url_prefix: '/',
            port: 3010
        },
        author: 'soomtong',
        revision: '1.0.0',
        cookieSecret: 'blititor',
        sessionSecret: 'blititor'
    },
    tweak: {
        passDBCheckMiddleware: false    // for speed
    }
};

var HOUR = 3600000;
var DAY = HOUR * 24;
var WEEK = DAY * 7;

global.BLITITOR = BLITITOR;

// check modules for npm, bower
require('../lib/dependency')(BLITITOR);

// load common library
var fs = require('fs');
var path = require('path');
var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash');
//var methodOverride = require('method-override');      // need this? let me know
var compress = require('compression');
var favicon = require('serve-favicon');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
//var swig = require('swig');       // replace nunjucks
var nunjucks = require('nunjucks');

// load custom library
var misc = require('../lib/misc');

// load DB configuration
var databaseDefault = require('./admin/database_default');
var databaseFile = databaseDefault.config_file;

// use sync function for convenience. it's initialization
fs.access(databaseFile, function (err) {    // can use fs.R_OK mode for option
    if (!err) {
/*
        fs.readFile(databaseFile, function (err, data) {
            BLITITOR.config.database = data;
        });
*/

        // simple better
        BLITITOR.config.database = require(path.join('..', databaseFile));
    }
});

// load route setup
var routeTable = misc.routeTable();

var route = require('./route');
var adminRoute = require('./admin_route');

// ready Express
var app = express();

// set express app
app.set('views', 'theme');
app.set('view engine', 'html');
//app.set('view cache', false);
app.set('port', BLITITOR.config.site.port);

// set template engine
nunjucks.configure(app.get('views'), {
    express: app,
    noCache: true
});

// using Express behind nginx
if (BLITITOR.env == 'production') {
    app.enable('trust proxy');
}

// use express middleware
var logFile = fs.createWriteStream('log/express.log', {flags: 'a'});

app.use(logger('combined', { stream: logFile }));
app.use(errorHandler({ dumpExceptions: true, showStack: true }));
app.use(favicon('public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compress({}));    // compress all for default
app.use(expressValidator());
//app.use(methodOverride());

// init session
app.use(cookieParser(BLITITOR.config.cookieSecret, {}));
app.use(session({
    secret: BLITITOR.config.sessionSecret,
    resave: true,
    saveUninitialized: true
}));
app.use(flash());   // requires cookieParser, session; reference locals.messages object
app.use(lusca.csrf());  // default key: _csrf

// set static files
var staticOptions = {
    dotfiles: 'allow',  // http://expressjs.com/4x/api.html#express many middleware is gone
    maxAge: WEEK
};

app.use(express.static('public', staticOptions));
app.use(express.static('theme', staticOptions));

// bind route
app.use(route);

// bind admin(manager) route
app.use(routeTable.admin_root, adminRoute);

// 500 Error Handler
app.use(errorHandler());

// start server
app.listen(app.get('port'), function () {
    console.log("\x1B[32m=== server listening on port " + app.get('port') + " ===\033[0m");
    // display default route table
    misc.showRouteTable(routeTable);
});

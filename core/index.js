// global bind
var BLITITOR = {
    env: process.env['NODE_ENV'] || 'development',
    root: __dirname + '/../',
    config: {
        site: {
            theme: 'basic',
            host: '',
            url_prefix: '/',
            port: 3003
        },
        author: 'soomtong',
        revision: '1.0',
        cookieSecret: 'blititor',
        sessionSecret: 'blititor'
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
var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash');
//var methodOverride = require('method-override');
var compress = require('compression');
var favicon = require('serve-favicon');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var swig = require('swig');

// load DB configuration
var databaseFile = 'database.conf.json';

fs.access(databaseFile, function (err) {    // can use fs.R_OK mode for option
    if (!err) {
        fs.readFile(databaseFile, function (err, data) {
            BLITITOR.config.database = data;
        });
    }
});

// load route setup
var route = require('./route');

// ready Express
var app = express();

// set template engine
app.engine('html', swig.renderFile);
swig.setDefaults({ cache: false });

// set express app
app.set('views', 'theme/' + BLITITOR.config.site.theme);
app.set('view engine', 'html');
app.set('view options', { layout: true });
app.set('view cache', false);
app.set('port', BLITITOR.config.site.port);

// using Express behind nginx
if (BLITITOR.env == 'production') {
    server.enable('trust proxy');
}

// use express middleware
var logFile = fs.createWriteStream('log/express.log', {flags: 'a'});

app.use(logger('combined', { stream: logFile }));
app.use(errorHandler({ dumpExceptions: true, showStack: true }));
app.use(favicon('public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compress());    // compress all for default
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
    dotfiles: 'allow',
    extensions: ['html'],
    etag: true,
    maxAge: WEEK
};

app.use(express.static('public', staticOptions));

// bind route
app.use(route);

// 500 Error Handler
app.use(errorHandler());

// start server
app.listen(app.get('port'), function () {
    console.log("\x1B[32m=== server listening on port " + app.get('port') + " ===\033[0m");
});

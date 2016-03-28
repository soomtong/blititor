// global bind
var BLITITOR = {
    env: process.env['NODE_ENV'] || 'development',
    logLevel: 'verbose',
    /* winston log level
     error: 0,
     warn: 1,
     info: 2,
     verbose: 3,
     debug: 4,
     silly: 5
     */
    root: __dirname + '/../',
    route: {},
    config: {
        site: {
            theme: '',
            host: '',
            url_prefix: '/',
            port: 3010
        },
        author: 'soomtong',
        revision: '0.0.0',  // will be bind next process
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
var winston = require('winston');

// set log
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true,
    timestamp: function() {
        var date = new Date();
        return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.toTimeString().substr(0,5) + ' [' + global.process.pid + ']';
    },
    level: BLITITOR.logLevel || (BLITITOR.env === 'production' ? 'info' : 'verbose')
});

// load custom library
var misc = require('./misc');

// load DB configuration
var databaseDefault = require('./admin/database_default');
var databaseFile = databaseDefault.config_file;

// use sync function for convenience. it's initialization
try {
    fs.accessSync(databaseFile, fs.R_OK);

    BLITITOR.config.database = require(path.join('..', databaseFile));
} catch (e) {
    winston.warn('database config file not exist');
}

// load Theme configuration
try {
    fs.accessSync('theme.json', fs.R_OK);

    var themeFile = require('../theme');

    fs.accessSync('./theme/' + themeFile.siteTheme, fs.R_OK);

    BLITITOR.config.site.theme = themeFile.siteTheme;

    winston.verbose('Set site theme to', BLITITOR.config.site.theme);
} catch (e) {
    winston.error('theme folder or config file not exist');

    var file = {
        "setupTheme": "simplestrap",
        "adminTheme": "simplestrap",
        "manageTheme": "simplestrap",
        "siteTheme": "simplestrap"
    };

    fs.writeFileSync('theme.json', JSON.stringify(file, null, 4));

    BLITITOR.config.site.theme = file.siteTheme;

    winston.verbose('Set site theme to', BLITITOR.config.site.theme);
}

// load route setup
// misc.setRoutePage();    //todo: will be removed, use database record when edit in admin page
var routeTable = misc.routeTable();

var route = require('./route');
var adminRoute = require('./admin/route');

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
app.use(errorHandler({ dumpExceptions: true, showStack: true, log: winston.error }));
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

// bind admin(manager) route
app.use(routeTable.admin_root, adminRoute);

// bind route
app.use(route);

// Handle 404
app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('../theme/simplestrap/page/_404', { url: req.url });
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
app.use(function(err, req, res, next){
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().
    res.status(err.status || 500);
    res.render('../theme/simplestrap/page/_500', { error: err });
});

// start server
app.listen(app.get('port'), function () {
    winston.info("\x1B[32m=== server listening on port " + app.get('port') + " ===\033[0m");
    // display default route table
    misc.showRouteTable(routeTable);
});

if (!process.send) {
    // If run using `node app`, log GNU copyright info along with server info
    winston.info('BLITITOR v' + BLITITOR.config.revision + ' Copyright (C) 2015 @soomtong.');
    winston.info('This program comes with ABSOLUTELY NO WARRANTY.');
    winston.info('This is free software, and you are welcome to redistribute it under certain conditions.');
    //winston.info('');
}
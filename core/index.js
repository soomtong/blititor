var fs = require('fs');
var path = require('path');

var BLITITOR = {};

// global configuration
BLITITOR.env = require('./lib/dependency')(process.env['NODE_ENV'] || 'development');
BLITITOR.root = path.join(__dirname, '..');
BLITITOR.tweak = {passDBCheckMiddleware: false}; // for speed
BLITITOR.config = require('./config/app_default.json');
BLITITOR.moduleList = require('./config/module_list.json');

// bind global
global.BLITITOR = BLITITOR;

// load common package
var http = require('http');
var socketIO = require('socket.io');
var express = require('express');
var expressValidator = require('express-validator');
var multer = require('multer');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mysqlSession = require('express-mysql-session');
var flash = require('connect-flash');
var device = require('express-device');
var compress = require('compression');
var favicon = require('serve-favicon');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var nunjucks = require('nunjucks');
var winston = require('winston');
var passport = require('passport');
var moment = require('moment');
var mkdirp = require('mkdirp');
var args = require('minimist');

// set log level
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true,
    timestamp: function() {
        var date = new Date();
        return (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.toTimeString().substr(0,5) + ' [' + global.process.pid + ']';
    },
    level: BLITITOR.config.logLevel || (BLITITOR.env === 'production' ? 'info' : 'verbose')
});

// load custom library
var socket = require('./lib/socket');
var connection = require('./lib/connection');
var common = require('./lib/common');
var misc = require('./lib/misc');

// load Database configuration
// be going to sync mode
misc.checkDatabaseConfiguration(BLITITOR.config.configFile || 'config.json');

// load Theme configuration
// be going to sync mode
misc.checkThemeConfiguration(BLITITOR.config.configFile || 'config.json');

// constants
var HOUR = 3600000;
var DAY = HOUR * 24;
var WEEK = DAY * 7;

// set locale
moment.locale(BLITITOR.config.locale);

// ready server
var app = express();
var server = http.Server(app);
var sio = socketIO(server);
var bootstrapArgv = args(process.argv.slice(2));

// set express app
app.set('views', 'theme');
app.set('view engine', 'html');
//app.set('view cache', false);
app.set('port', bootstrapArgv['port'] || bootstrapArgv.p || BLITITOR.config.site.service.port);

// set template engine
nunjucks.configure(app.get('views'), {
    express: app,
    noCache: true
});

// using Express behind nginx
if (BLITITOR.env == 'production') {
    app.enable('trust proxy');
}

// bind socket.io to global for convenience
if (!BLITITOR._socketIO) {
    BLITITOR._socketIO = sio;
}

// use express middleware
var logFile = fs.createWriteStream('core/log/express.log', {flags: 'a'});

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/upload/temp');
    },
    filename: function (req, file, callback) {
        if (!file.mimetype) return Error('Uploaded file is not Acceptable');

        var arrExt = file.originalname.split('.');
        var filename = common.UUID1() + '.' + arrExt[arrExt.length - 1];
        callback(null, filename);   //can refer file.mimetype.split('/')[1]
    }
});

var multerUploader = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024
    }
});

try {
    mkdirp.sync(path.join('public', 'upload', 'temp'));
} catch (e) {
    winston.warn('file upload folder not exist');
}

app.use(logger('combined', { stream: logFile }));
app.use(errorHandler({ dumpExceptions: true, showStack: true, log: winston.error }));
app.use(favicon(path.join('public', 'favicon.ico')));
app.use(multerUploader.any());  // should set before csrf middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(device.capture({parseUserAgent: true}));
app.use(compress({}));    // compress all for default
app.use(expressValidator({errorFormatter: common.errorFormatter}));

// prepare session store
var mysqlStore = mysqlSession(session);

// init session
connection.initSession(mysqlStore, function (sessionOptions) {
    var sessionMiddleware = session(sessionOptions);

    app.use(sessionMiddleware);
    sio.use(socket.bindSession(sessionMiddleware));
});

// middleware
app.use(cookieParser(BLITITOR.config.cookieSecret, {}));
app.use(flash());   // requires cookieParser, session; reference locals.messages object
app.use(passport.initialize());
app.use(passport.session());
app.use(lusca.csrf());  // default key: _csrf

// set static files
var staticOptions = {
    dotfiles: 'allow',  // http://expressjs.com/4x/api.html#express many middleware is gone
    maxAge: WEEK
};

app.use(express.static('public', staticOptions));
app.use(express.static('theme', staticOptions));

// bind route
app.use(require('./route'));

// start server
server.listen(app.get('port'), function () {
    winston.info("\x1B[32mServer listening on port \033[0m" + app.get('port') + "\x1B[32m in " + BLITITOR.env + " mode \033[0m");
    // display default route table
    // misc.showRouteTable();
});

if (!process.send) {
    // If run using `node app`, log copyright info along with server info
    var config = require('../package.json');
    winston.info('BLITITOR v' + config.version + ' Copyright (C) 2016 @' + config.author + '.');
    winston.info('This program comes with ABSOLUTELY NO WARRANTY.');
    winston.info('This is free software, under ' + config.license + ' license');
    winston.info('and you are welcome to redistribute it under certain conditions.');
    winston.verbose('module data file loaded.', BLITITOR.moduleList.length, 'modules located');

    if (BLITITOR.env == 'development') { // Only in dev environment
        misc.showGlobalVar(BLITITOR);
        require('express-print-routes')(app, path.join(__dirname, './log/site-routes.log'));
    }
}
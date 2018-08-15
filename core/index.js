const fs = require('fs');
const path = require('path');

let BLITITOR = {};

// global configuration
BLITITOR.env = require('./lib/dependency')(process.env['NODE_ENV'] || 'development');
BLITITOR.root = path.join(__dirname, '..');
BLITITOR.route = { root: '/' };
BLITITOR.tweak = { passDBCheckMiddleware: false }; // for speed
BLITITOR.config = require('./config/app_default.json');
BLITITOR.moduleList = require('./config/module_list.json');

// bind global
global.BLITITOR = BLITITOR;

// load common package
const http = require('http');
const socketIO = require('socket.io');
const express = require('express');
const expressValidator = require('express-validator');
const multer = require('multer');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mysqlSession = require('express-mysql-session');
const flash = require('connect-flash');
const device = require('express-device');
const compress = require('compression');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const nunjucks = require('nunjucks');
const winston = require('winston');
const passport = require('passport');
const moment = require('moment');
const mkdirp = require('mkdirp');
const args = require('minimist');
const clc = require('cli-color');

// set log level
if (BLITITOR.env === 'production') {
    winston.add(new winston.transports.File({
        filename: path.join(__dirname, 'log', 'winston.log'),
        format: winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
        level: BLITITOR.config.logLevel || 'verbose'
    }));
} else {
    winston.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
                format: 'MM-DD HH:mm:ss'
            }),
            // winston.format.simple(),
            winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
        level: BLITITOR.config.logLevel || 'debug'
    }));
}

// load custom library
const socket = require('./lib/socket');
const connection = require('./lib/connection');
const common = require('./lib/common');
const misc = require('./lib/misc');

// load Database configuration
// be going to sync mode
misc.checkDatabaseConfiguration(BLITITOR.config.configFile || 'config.json');

// load Theme configuration
// be going to sync mode
misc.checkThemeConfiguration(BLITITOR.config.configFile || 'config.json');

// load Route data configuration
// be going to sync mode
misc.setRouteTable(BLITITOR.moduleList || []);

// constants
const HOUR = 3600000;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

// set locale
moment.locale(BLITITOR.config.locale);

// ready server
const app = express();
const server = http.Server(app);
const sio = socketIO(server);
const bootstrapArgv = args(process.argv.slice(2));

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
if (BLITITOR.env === 'production') {
    app.enable('trust proxy');
    winston.info('Use trust proxy mode for Nginx');
}

// bind socket.io to global for convenience
if (!BLITITOR._socketIO) {
    BLITITOR._socketIO = sio;
}

// use express middleware
const logFile = fs.createWriteStream('core/log/express.log', { flags: 'a' });

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/upload/temp');
    },
    filename: function (req, file, callback) {
        if (!file.mimetype) return Error('Uploaded file is not Acceptable');

        const arrExt = file.originalname.split('.');
        const filename = common.UUID1() + '.' + arrExt[arrExt.length - 1];
        callback(null, filename);   //can refer file.mimetype.split('/')[1]
    }
});

const multerUploader = multer({
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

app.use(morgan('combined', { stream: logFile }));
app.use(errorHandler({ dumpExceptions: true, showStack: true, log: winston.error }));
app.use(multerUploader.any());  // should set before csrf middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(device.capture({parseUserAgent: true}));
app.use(compress({}));    // compress all for default
app.use(expressValidator({errorFormatter: common.errorFormatter}));

// prepare session store
const mysqlStore = mysqlSession(session);

// init session
connection.initSession(mysqlStore, function (sessionOptions) {
    const sessionMiddleware = session(sessionOptions);

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
const staticOptions = {
    dotfiles: 'allow',  // http://expressjs.com/4x/api.html#express many middleware is gone
    maxAge: WEEK
};

// bind static
app.use(express.static('public', staticOptions));
app.use(express.static('theme', staticOptions));

// bind route
app.use(require('./route'));

// start server
server.listen(app.get('port'), function () {
    winston.info('Server listening on port ' + app.get('port') + ' in ' + BLITITOR.env + ' mode')
    console.info("=== Server listening on port " + clc.yellow(app.get('port')) + " in " + clc.red(BLITITOR.env) + " mode");
    // display default route table
    // misc.showRouteTable();
});

if (!process.send) {
    // If run using `node app`, log copyright info along with server info
    const config = require('../package.json');
    winston.info('----------------------------------------------------------------');
    winston.info('BLITITOR v' + config.version + ' Copyright (C) 2016 @' + config.author + '.');
    winston.info('This program comes with ABSOLUTELY NO WARRANTY.');
    winston.info('This is free software, under ' + config.license + ' license');
    winston.info('and you are welcome to redistribute it under certain conditions.');
    winston.info('----------------------------------------------------------------');
    winston.verbose('module data file loaded. ' + BLITITOR.moduleList.length + ' modules located');

    if (BLITITOR.env === 'development') { // Only in dev environment
        setTimeout(function () {
            misc.showGlobalVar(BLITITOR);
            misc.showRoutes(app);
        }, 1000);
    }
}
var fs = require('fs');
var path = require('path');
var async = require('neo-async');

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
var chatting = require('../module/chatting');
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

// set log
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true,
    timestamp: function() {
        var date = new Date();
        return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.toTimeString().substr(0,5) + ' [' + global.process.pid + ']';
    },
    level: BLITITOR.config.logLevel || (BLITITOR.env === 'production' ? 'info' : 'verbose')
});

// load custom library
var common = require('./lib/common');
var misc = require('./lib/misc');

// load Database configuration
var databaseFile = BLITITOR.config.databaseConfig, databaseSetting;

try {
    fs.accessSync(databaseFile, fs.R_OK);

    databaseSetting = require(path.join('..', databaseFile));

    BLITITOR.config.database = databaseSetting;

    winston.info('database config file loaded');
} catch (e) {
    winston.warn('database config file not exist');
}

// load Theme configuration
var themeFile = BLITITOR.config.themeConfig, themeSetting;

try {
    fs.accessSync(themeFile, fs.R_OK);

    themeSetting = require(path.join('..', themeFile));

    fs.accessSync('./theme/' + themeSetting.siteTheme, fs.R_OK);

    BLITITOR.config.site.app = themeSetting.appTheme;
    BLITITOR.config.site.theme = themeSetting.siteTheme;
    BLITITOR.config.site.adminTheme = themeSetting.adminTheme;
    BLITITOR.config.site.manageTheme = themeSetting.manageTheme;

    winston.info("Set site app to '" + BLITITOR.config.site.app + "'");
    winston.info("Set site theme to '" + BLITITOR.config.site.theme + "'");
    winston.info("Set site admin theme to '" + BLITITOR.config.site.adminTheme + "'");
    winston.info("Set site manage theme to '" + BLITITOR.config.site.manageTheme + "'");
} catch (e) {
    winston.error('theme folder or config file not exist');

    var file = {
        "appTheme": "plain",
        "siteTheme": "plain",
        "adminTheme": "plain",
        "manageTheme": "plain"
    };

    fs.writeFileSync(themeFile, JSON.stringify(file, null, 4));

    BLITITOR.config.site.app = file.appTheme;
    BLITITOR.config.site.theme = file.siteTheme;

    winston.verbose("Set site app to '" + BLITITOR.config.site.app + "'");
    winston.verbose("Set site theme to '" + BLITITOR.config.site.theme + "'");
}

var HOUR = 3600000;
var DAY = HOUR * 24;
var WEEK = DAY * 7;

// set locale
moment.locale(BLITITOR.config.locale);

// ready Express server
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var bootstrapArgv = args(process.argv.slice(2));

// set express app
app.set('views', 'theme');
app.set('view engine', 'html');
//app.set('view cache', false);
app.set('port', bootstrapArgv.port || bootstrapArgv.p || BLITITOR.config.site.port);

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
    mkdirp.sync('./public/upload/temp');
} catch (e) {
    winston.warn('file upload folder not exist');
}

app.use(logger('combined', { stream: logFile }));
app.use(errorHandler({ dumpExceptions: true, showStack: true, log: winston.error }));
app.use(favicon('public/favicon.ico'));
app.use(multerUploader.any());  // should set before csrf middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(device.capture({parseUserAgent: true}));
app.use(compress({}));    // compress all for default
app.use(expressValidator({errorFormatter: common.errorFormatter}));

// prepare session store
var mysqlStore = mysqlSession(session);
var databaseConfiguration = BLITITOR.config.database;
var sessionStore;
var sessionOptions = {
    secret: BLITITOR.config.sessionSecret,
    resave: true,
    saveUninitialized: true
};

if (databaseConfiguration) {
    winston.info("start to make mysql connection process for global session system");

    sessionStore = new mysqlStore({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword,
        autoReconnect: false,
        useConnectionPooling: true,
        schema: {
            tableName: common.databaseDefault.prefix + 'session'
        }
    });

    // var connection = require('./lib/connection');

    var iteratorAsync = function (item, callback) {
        console.log('@@@'.green, item);
        if (!item.ignore && item.useDatabase) {
            var moduleName = item.folder;
            console.log('NOW THEME :'.green, moduleName);

            existsThemeTable(moduleName, function () {
                callback(null, moduleName);
            });
        } else {
            callback();
        }
    };
   // database.createDatabase(connection, connectionInfo.dbName, function () {
        // make tables!
        async.mapSeries(BLITITOR.moduleList, iteratorAsync, function(result){
            console.log(' = Check Table ... Done \n'.green);
            next && next();
        });
    //});

    // sessionStore = new mysqlStore(storeOption);
    sessionOptions.store = sessionStore;
} else {
    winston.warn("Database Session store is not Valid, use Internal Session store. check database configuration and restart Application!");
}

//각 모듈의 db.js에 추가할 부분
function existsThemeTable(connection, moduleName, callback) {
    var tables = {
        guestbook: common.databaseDefault.prefix + moduleName
    };
    //var sql = "SHOW TABLES LIKE ??";
    var sql = "SHOW TABLES";
    var tableList = [tables.teamblog, tables.teamblogHistory, tables.teamblogRelated, tables.teamblogTag, tables.teamblogTagRelated];

    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: databaseConfiguration.dbHost,
        port: databaseConfiguration.dbPort || common.databaseDefault.port,
        database: databaseConfiguration.dbName || common.databaseDefault.database,
        user: databaseConfiguration.dbUserID,
        password: databaseConfiguration.dbUserPassword
    });

 var query = connection.query('SHOW TABLES',function(err,rows){
        console.log('EXISTS : ', rows);
    });
}

// function checkThemeDatabaseTable(moduleName, callback){
//     console.log(" = Check database tables for " + moduleName + " module".rainbow);

//     var connectionInfo = require(path.join('..', databaseFile));
//     var module = require('../module/'+ moduleName + '/lib/database');

//     // inset dummy data after create table
//     //module.
//     existsThemeTable(connectionInfo, moduleName, function () {
//         callback && callback(null, moduleName);
//     });
// }

// init session
var sessionMiddleware = session(sessionOptions);

app.use(cookieParser(BLITITOR.config.cookieSecret, {}));
app.use(sessionMiddleware);
io.use(function(socket, next) { sessionMiddleware(socket.request, socket.request.res, next); }); // send Express session to socket
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

// bind socket.io
chatting.socketWrapper(io, function(err){
    if(err){
        winston.warn('Can not bind socket event.');
    }
    else{
        winston.info('Binding for socket event was success.');
    }
});

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
    winston.info('BLITITOR v' + BLITITOR.config.revision + ' Copyright (C) 2015 @' + BLITITOR.config.author + '.');
    winston.info('This program comes with ABSOLUTELY NO WARRANTY.');
    winston.info('This is free software,');
    winston.info('and you are welcome to redistribute it under certain conditions.');
    winston.verbose('module data file loaded.', BLITITOR.moduleList.length, 'modules located');

    if (BLITITOR.env == 'development') { // Only in dev environment
        require('express-print-routes')(app, path.join(__dirname, './log/site-routes.log'));
        fs.writeFileSync(path.join(__dirname, './log/global-vars.log'), JSON.stringify(BLITITOR, null, 4));
    }
}
var express = require('express');
var cons = require('consolidate'),
    swig = require('swig');

var route = require('./lib/route');
var config = require('./lib/config').get();

var app = express();

// set template engine
app.engine('html', cons.swig);
swig.init({
    root: __dirname + '/views',
    allowErrors: true,
    cache: false
});

// set express app
app.set('port', config.port);
app.set('view engine', 'html');
app.set('view options', { layout: false });
app.set('views', __dirname + '/views');
app.set('view cache', false);

app.locals({
    title: "humble blog for node.js",
    revision: 1
});

// using Express behind nginx
app.enable('trust proxy');

// use express middleware
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
app.use(express.favicon(__dirname + '/public/favicon.ico'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// inti session
app.use(express.cookieParser(config.cookieId));
app.use(express.session({ secret: config.sessionToken }));

// use express router
app.use(app.router);

// set static files
app.use(express.static(__dirname + '/public'));

// route
route.bind(app);

// server
app.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

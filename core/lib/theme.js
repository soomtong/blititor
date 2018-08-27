var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var async = require('neo-async');
var winston = require('winston');

var common = require('./common');

function getThemeList(themeFolder, callback) {
    fs.readdir(themeFolder, function (error, directories) {
        async.map(directories, getThemeInfo,
            function (error, result) {
                callback(result);
            });
    });
}

function getThemeInfo(directory, done) {
    console.log(' = Processed directory...', directory);

    function getScreenshot(done) {
        var screenshot;
        var file = path.join('theme', directory, 'screenshot.jpg');
        fs.access(file, fs.R_OK, function (err) {
            if (err) {
                winston.warn(err);
            } else {
                screenshot = 'screenshot.jpg';
            }
            done(null, screenshot);
        });
    }

    function getDescription(done) {
        var description = {}, md;
        var file = path.join('theme', directory, 'description.md');
        fs.access(file, fs.R_OK, function (err) {
            if (err) {
                winston.warn(err);
            } else {
                md = fs.readFileSync(file, 'utf8');
                description = common.destructMarkdown(md);
            }
            done(null, description);
        });
    }

    async.parallel([getScreenshot, getDescription], function (error, result) {
        var themeInfo = {
            folderName: directory,
            screenshot: result[0],
            description: result[1],
            included: ['A', 'M', 'S']   // admin, manage, site
        };

        done(null, themeInfo);
    });
}

function getFavicon(themeName) {
    var themeFaviconPath = path.join('.', 'theme', themeName, 'common', 'asset', 'favicon.ico');
    var defaultFaviconPath = path.join('public', 'common', 'favicon.ico');

    if (fs.existsSync(themeFaviconPath)) {
        winston.info('bind theme favicon: /' + themeFaviconPath);

        return favicon(themeFaviconPath);
    } else {
        winston.verbose('bind default favicon: /' + defaultFaviconPath);

        return favicon(defaultFaviconPath);
    }
}

function bindFavicon(router, themeName) {
    var faviconPath = path.join('.', 'theme', themeName, 'common', 'asset', 'favicon.ico');

    fs.stat(faviconPath, function (error, stat) {
        if (error) {
            winston.info('bind theme favicon');

            router.use(favicon(path.join('public', 'common', 'favicon.ico')))
        } else {
            winston.verbose('bind default favicon');

            router.use(favicon(faviconPath));
        }
    });
}

function get404Handler(themeName) {
    return function _404Handler(req, res, next){
        res.status(404);
        winston.warn(`error status 404: ${req.url}`);

        // respond with html page
        if (req.accepts('html')) {
            fs.stat(path.join('.', 'theme', themeName, 'page', '_500.html'), function (error, stat) {
                if (error) {
                    res.render('status404', { url: req.url });
                } else {
                    res.render('../theme/' + themeName + '/page/_404', { url: req.url });
                }
            });
            return;
        }

        // respond with json
        if (req.accepts('json')) {
            res.send({ error: 'Not found' });
            return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
    }
}

function get500Handler(themeName) {
    return function _500Handler(err, req, res, next){
        // we may use properties of the error object
        // here and next(err) appropriately, or if
        // we possibly recovered from the error, simply next().
        res.status(err.status || 500);
        winston.error(`get 500 handler ${err}`);

        // set default 500 page
        fs.stat(path.join('.', 'theme', themeName, 'page', '_500.html'), function (error, stat) {
            if (error) {
                res.render('status500', { error: err });
            } else {
                res.render('../theme/' + themeName + '/page/_500', { error: err });
            }
        });
    }
}


module.exports = {
    getThemeList: getThemeList,
    getFavicon: getFavicon,
    bindFavicon: bindFavicon,
    get404Handler: get404Handler,
    get500Handler: get500Handler
};
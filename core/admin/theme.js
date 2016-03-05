var fs = require('fs');
var async = require('neo-async');
var winston = require('winston');

function themeSetupView(req, res) {
    var params = {
        themeList: []
    };

    getThemeList(BLITITOR.root + 'theme', function (themeList) {
        params.themeList = themeList;

        res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/setup-theme', params);
    });
}

function themeSetup(req, res) {

    res.render();
}

function themeInitView(req, res) {

    res.render();
}

function themeInit(req, res) {


    res.redirect(res.locals.route.admin_root);    // goto admin main page

}

function getThemeList(themeFolder, callback) {
    fs.readdir(themeFolder, function (error, directories) {
        async.map(directories, getThemeInfo,
            function (error, result) {
                callback(result);
            });
    });
}

function getThemeInfo(directory, done) {
    var getScreenshot = function (done) {
        var screenshot;
        var file = BLITITOR.root + 'theme/' + directory + '/screenshot.jpg';
        fs.access(file, fs.R_OK, function (err) {
            if (err) {
                winston.warn(err);
            } else {
                screenshot = 'screenshot.jpg';
            }
            done(null, screenshot);
        });
    };
    var getDescription = function (done) {
        var description;
        var file = BLITITOR.root + 'theme/' + directory + '/desc.md';
        fs.access(file, fs.R_OK, function (err) {
            if (err) {
                winston.warn(err);
            } else {
                description = fs.readFileSync(file);
            }
            done(null, description);
        });
    };

    async.parallel([getScreenshot, getDescription], function (error, result) {
        var themeInfo = {
            folderName: directory,
            screenshot: result[0],
            description: result[1]
        };

        done(null, themeInfo);
    });
}

function makeDefaultThemeConfiguration(options) {

}

module.exports = {
    themeSetupView: themeSetupView,
    themeSetup: themeSetup,
    themeInitView: themeInitView,
    themeInit: themeInit,
    makeDefaultThemeConfiguration: makeDefaultThemeConfiguration
};
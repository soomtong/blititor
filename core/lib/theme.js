var fs = require('fs');
var path = require('path');
var async = require('neo-async');
var winston = require('winston');

var common = require('./common');
var misc = require('./misc');

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


module.exports = {
    getThemeList: getThemeList,
};
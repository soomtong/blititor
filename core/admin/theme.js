var fs = require('fs');
var async = require('neo-async');
var winston = require('winston');

var common = require('../lib/common');

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
    var params = {
        theme: req.body['theme'],
        insertData: req.body['insert_sample']
    };

    console.log(params);
    console.log('done move to root', res.locals.route.root);
    // todo: init theme and insert sample data
    // todo: make index to `theme/page/index.html`

    themeInit({ theme: params.theme });

    res.redirect(res.locals.route.root);
}

function themeInit(options) {

    console.log(options);


    // init theme default data to database...

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
    console.log(' = Processed directory...', directory);

    function getScreenshot(done) {
        var screenshot;
        var file = 'theme/' + directory + '/screenshot.jpg';
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
        var file = 'theme/' + directory + '/description.md';
        fs.access(file, fs.R_OK, function (err) {
            if (err) {
                winston.warn(err);
            } else {
                md = fs.readFileSync(file);
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

function makeDefaultThemeConfiguration(options) {

}

module.exports = {
    getThemeList: getThemeList,
};
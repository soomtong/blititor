var fs = require('fs');
var misc = require('../../lib/misc');

var routeTable = misc.routeTable();

function themeSetupView(req, res) {
    var params = {};

    console.log(res.locals);

    res.render(res.locals.site.theme + '/' + res.locals.site.themeType.setup + '/setup-theme', params);
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

function makeDefaultThemeConfiguration(options) {

}

module.exports = {
    themeSetupView: themeSetupView,
    themeSetup: themeSetup,
    themeInitView: themeInitView,
    themeInit: themeInit,
    makeDefaultThemeConfiguration: makeDefaultThemeConfiguration
};
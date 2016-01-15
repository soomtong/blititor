var misc = require('../../lib/misc');

var routeTable = misc.routeTable();

// view page
function databaseSetupView(req, res) {
    var params = {

    };

    console.log(res.locals);

    // load theme folder as it's condition
    res.render(res.locals.site.theme + '/' + res.locals.site.themeType + '/setup-database', params);
}

function databaseSetup(req, res) {
    var params = {

    };

    console.log('result from client', req.body);

    if (true) {
        res.render(res.locals.site.theme + '/' + res.locals.site.themeType + '/partial/setup-database-done', params);
    } else {
        res.render(res.locals.site.theme + '/' + res.locals.site.themeType + '/partial/setup-database-error', params);
    }
}
module.exports = {
    databaseSetupView: databaseSetupView,
    databaseSetup: databaseSetup
};
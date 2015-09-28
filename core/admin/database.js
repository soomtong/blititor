// view page
function databaseSetup(req, res) {
    var params = {

    };

    console.log(res.locals);

    // load theme folder as it's condition
    res.render(res.locals.site.theme + '/setup-database', params);
}

module.exports = {
    databaseSetup: databaseSetup
};
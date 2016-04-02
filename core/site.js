var winston = require('winston');

function pages(req, res) {
    var params = {
        title: "Home",
        path: req.path,
        page: req.path.match(/\/([^\/]+)\/?$/)[1].replace(/-/g, '_')
    };

    winston.info(req.path, params);
    // console.log(res.locals.menu);

    res.render(BLITITOR.config.site.theme + '/page/' + params.page, params);
}

module.exports = {
    pages: pages
};

var winston = require('winston');
var common = require('./lib/common');

var filter = common.regexFilter();

function pages(req, res) {

    var params = {
        title: "Home",
        path: req.path,
        page: req.path.match(filter.page)[1].replace(/-/g, '_'),
        user: req.user
    };

    // winston.info(req.path, params, req.path.match(filter.page));
    // console.log(res.locals.menu);

    res.render(BLITITOR.config.site.theme + '/page/' + params.page, params);
}

module.exports = {
    pages: pages
};

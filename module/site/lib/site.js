var winston = require('winston');
var common = require('../../../core/lib/common');

var filter = common.regexFilter();

function indexPage(req, res) {
    var params = {
        title: "Home",
        user: req.user,
        message: req.flash()
    };

    winston.info(req.path);

    //500 Error
    //throw Error('make noise!');

    // load recent articles

    res.render(BLITITOR.config.site.theme + '/page/index', params);
}

function plainPage(req, res) {

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
    index: indexPage,
    blog: plainPage,
    about: plainPage,
    write: plainPage,
    pages: plainPage,
    sign_in: plainPage,
    sign_up: plainPage,
    sign_out: plainPage,
};

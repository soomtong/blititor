var winston = require('winston');

function index(req, res) {
    var params = {
        title: "Home"
    };

    winston.info(req.path);

    //500 Error
    //throw Error('make noise!');

    // load recent articles

    res.render(BLITITOR.config.site.theme + '/page/index', params);
}

function pages(req, res) {
    var params = {
        title: "Home",
        page: req.path
    };

    winston.info(req.path);
    // console.log(res.locals.menu);

    var isPage = req.path.indexOf('/') == 0 && req.path.length > 1;

    if (isPage) {
        res.render(BLITITOR.config.site.theme + '/page' + req.path, params);
    } else {
        res.render(BLITITOR.config.site.theme + '/page/index', params);
    }
}

module.exports = {
    index: index,
    blog: pages,
    guest: pages,
    about: pages,
    write: pages,
    pages: pages,
    sign_in: pages,
    sign_up: pages,
    sign_out: pages,
};
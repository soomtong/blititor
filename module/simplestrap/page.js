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
        path: req.path,
        page: req.path.match(/\/([^\/]+)\/?$/)[1].replace(/-/g,'_')
    };

    winston.info(req.path, params);
    // console.log(res.locals.menu);

    var isPage = req.path.indexOf('/') == 0 && req.path.length > 1;

    if (isPage) {
        res.render(BLITITOR.config.site.theme + '/page' + params.page, params);
    } else {
        res.render(BLITITOR.config.site.theme + '/page/index', params);
    }
}

function signIn(req, res) {
    // sign in and grant user access level
    var prevLocation = '/';



    res.redirect(prevLocation);
}

function signUp(req, res) {
    var prevLocation = '/';



    res.redirect(prevLocation);
}

function signOut(req, res) {


    res.redirect('/');
}

module.exports = {
    index: index,
    blog: pages,
    guest: pages,
    about: pages,
    write: pages,
    pages: pages,
    sign_in: signIn,
    sign_up: signUp,
    sign_out: signOut,
};
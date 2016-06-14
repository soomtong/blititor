// todo: move to page module, site module

var winston = require('winston');
var site = require('../../core/site');
var common = require('../../core/lib/common');

function index(req, res) {
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

function signIn(req, res) {
    // sign in and grant user access level
    var prevLocation = '/';

    // res.redirect(prevLocation);

    var params = {
        title: "Home",
        user: req.user,
        message: req.flash()
    };

    // res.cookie('name', 'tobi', {expires: new Date(Date.now() + 900000)});

    res.render(BLITITOR.config.site.theme + '/page/account/sign_in', params);

}

function signUp(req, res) {
    // var prevLocation = '/';
    // res.redirect(prevLocation);

    var params = {
        title: "Home",
        user: req.user,
        message: req.flash()
    };

    console.log(params);

    res.render(BLITITOR.config.site.theme + '/page/account/sign_up', params);
}

function signOut(req, res) {
    res.clearCookie('remember_me');     // clear the remember me cookie when logging out
    req.logOut();   // it aliased as req.logout()
    res.redirect('/');
    winston.info('signed out');
}

module.exports = {
    index: index,
    blog: site.pages,
    about: site.pages,
    write: site.pages,
    pages: site.pages,
    sign_in: signIn,
    sign_up: signUp,
    sign_out: signOut,
};
var winston = require('winston');

var site = require('../../core/site');

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
    blog: site.pages,
    guest: site.pages,
    about: site.pages,
    write: site.pages,
    pages: site.pages,
    sign_in: signIn,
    sign_up: signUp,
    sign_out: signOut,
};
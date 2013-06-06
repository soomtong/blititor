exports.login = function (req, res) {
    var params = {
        accessIP: req.ip,
        redirect: req.param('to'),
        remember: req.cookies.blititor,
        menu: [
            {
                name: "List",
                link: "/list",
                css: "",
                key: "1"
            },
            {
                name: "View",
                link: "/view",
                css: "",
                key: "2"
            }
        ],
        view: {
            title: "title 10",
            link: "/",
            desc: "description"
        }
    };

    req.session.login = null;

    res.render('login', params);
};

exports.logout = function (req, res) {
    req.session.login = null;
    res.redirect('/');
};

exports.authorize = function (req, res) {
    var login = {
        id: req.param('login'),
        pw: req.param('password'),
        remember: req.param('remember_id')
    };

    var sess = req.session;
    var auth = global.config['author'] || {};

    if (auth.id == login.id && auth.pw == login.pw) {
        sess.login = login.id;
        if (login.remember) {
            res.cookie('blititor', login.id);
        } else {
            res.clearCookie('blititor');
        }
        res.redirect('/');
    } else {
        sess.login = null;
        sess.error = 'authorize failed';
        res.redirect('back');
    }
};

exports.needLogin = function (req, res, next) {
    var session = req.session;
    if (session.login) {
        next();
    } else {
        res.redirect('/login?to=redirect');
    }
};
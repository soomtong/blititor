var home = require('./home');
var post = require('./post');
var auth = require('./auth');

exports.bind = function (app) {
    app.get('/', home.getIndex);

    app.get('/list/:page?', post.listPost);

    app.get('/view/:id?', post.viewPost);
    app.get('/post/:id?', auth.needLogin, post.postForm);
    app.post('/post', auth.needLogin ,post.makePost);
    // for ajax post
    app.post('/upload', auth.needLogin, post.uploadPost);
    app.post('/upload/file', auth.needLogin, post.uploadFile);

    app.get('/login', auth.login);
    app.get('/logout', auth.logout);
    app.get('/auth', auth.needLogin);
    app.post('/auth', auth.authorize);
};

exports.bindAdmin = function (app) {
    app.get('/admin', function (req, res) {
        res.send('admin page');
    });
};
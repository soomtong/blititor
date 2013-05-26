var home = require('./home');
var post = require('./post');
var auth = require('./auth');

exports.bind = function (app) {
    app.get('/', home.getIndex);

    app.get('/list/:page?', post.listPost);

    app.get('/view/:id?', post.viewPost);
    app.get('/post/:id?', auth.needLogin, post.postForm);
    app.post('/post', auth.needLogin ,post.makePost);

    app.get('/login', auth.login);
    app.get('/logout', auth.logout);
    app.post('/auth', auth.authorize);
};

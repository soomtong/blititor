var async = require('async');
var post = require('./model/post');
var getPage = require('./utility').getPageParams;

exports.listPost = function (req, res) {
    var params = {
        login: req.session.login,
        page:req.param('p') || 1
    };
    var pageParam = global.config['pageParam'];

    async.parallel([
        function (callback) {
            post.getMenu(function (error, menu) {
                callback(error, menu);
            });
        },
        function (callback) {
            var args = {
                page: params.page,
                pageSize: pageParam.size
            };
            post.getPostList(args, function (error, document) {
                callback(error, document);
            });
        },
        function (callback) {
            post.getPostListCountAll(function (error, count) {
                callback(error, count);
            });
        }
    ], function (error, results) {
        params.menu = results[0];
        params.list = results[1];
        params['page_param'] = getPage(Number(results[2]), Number(params.page), Number(pageParam.size), Number(pageParam.gutter));

        res.render('list', params);
    });
};

exports.viewPost = function (req, res) {
    var params = {
        login: req.session.login,
        id: req.param('id')
    };

    async.parallel([
        function (callback) {
            post.getMenu(function (error, menu) {
                callback(error, menu);
            });
        },
        function (callback) {
            post.getPost(params.id, function (error, document) {
                callback(error, document);
            });
        }
    ], function (error, results) {
        params.menu = results[0];
        params.view = results[1];

        res.render('view', params);
    });
};

exports.postForm = function (req, res) {
    var params = {
        login: req.session.login,
        id: req.param('id')
    };

    async.parallel([
        function (callback) {
            post.getMenu(function (error, menu) {
                callback(error, menu);
            });
        }
    ], function (error, results) {
        params.menu = results[0];

        res.render('form', params);
    });
};

exports.makePost = function (req, res) {
    var postDocs = req.body;
    postDocs.files = req.files;
    postDocs.author = req.session.login;
    postDocs.home = Number(postDocs.home);

    if (postDocs.title) {
        // add post model
        post.setPost(postDocs, function (error, result) {
            res.send('<textarea data-type="application/json">' + result[0]._id + '</textarea>');
        });
    } else {
        res.send('<textarea data-type="application/json"></textarea>');
    }
};
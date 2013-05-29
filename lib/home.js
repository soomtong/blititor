var async = require('async');
var post = require('./model/post');

exports.getIndex = function (req, res) {
    var params = {
        login: req.session.login
    };

    async.parallel([
        function (callback) {
            post.getMenu(function (error, menu) {
                callback(error, menu);
            });
        },
        function (callback) {
            var args = {
                page: 1,
                pageSize: 3,
                home: 1
            };
            post.getPostList(args, function (error, document) {
                callback(error, document);
            });
        },
        function (callback) {
            var args = {
                page: 1,
                pageSize: 3,
                home: { $ne: 1 }
            };
            post.getPostList(args, function (error, document) {
                callback(error, document);
            });
        }
    ], function (error, results) {
        params.menu = results[0];
        params.featured = results[1];
        params.list = results[2];

        res.render('index', params);
    });
};

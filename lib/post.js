var fs = require('fs');
var async = require('async');
var upload = require('express-upload');
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
    console.log(postDocs);
    if (postDocs.title) {
        // store file
        fs.readFile(postDocs.files.bg_image.path, function (err, data) {
            console.log(__dirname);
            var newPath = './public/'+ postDocs.files.bg_image.name;
            fs.writeFile(newPath, data, function (error) {
                if (error) {
                    res.redirect('back');
                }
            });
        });

        // add post model
        post.setPost(postDocs, function (error, result) {
            res.redirect('/list/' + result[0]._id);
        });
    } else {
        res.redirect('back');
    }
};

exports.uploadPost = function (req, res) {
    var params = {
        file: req.files,
        body: req.body,
        form: req.form
    };

    if (params.body.title) {
        post.setPost(params.body, function (error, result) {

            if (params.file['bg_image']) {
                var uploaded = {
                    before :decodeURI(params.file['bg_image'].name)
                };

                upload().to(['public', 'upload']).exec(params.file['bg_image'], function (error, file) {
                    if (!error) {
                        uploaded.after = file.name;
                        uploaded.size = file.size;
                        uploaded.type = file.type;
                        uploaded.tag = params.body.tag;

                        // update mongo
                        var doc = {
                            _id: result[0]._id.toString(),
                            bg_image: uploaded.after
                        };
                        post.setPost(doc, function (error, result) {
                            console.log(result);
                        });
                        // insert mongo
                        /*
                         files.createFile(uploaded, function (error, result) {
                         result[0].createdAt = formatDateTime(result[0].createdAt);
                         res.send(result[0]);
                         });
                         */
                        //res.send(result[0]._id);
                    }
                });
            }

            res.send({id: result[0]._id});
        });
    } else {
        res.send({result:false});
    }

};
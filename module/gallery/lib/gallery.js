var fs = require('fs');
var winston = require('winston');
var imageProcessor = require('lwip');
var mkdirp = require('mkdirp');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');

var db = require('./database');

var size = {
    width: 80,
    height: 60
};

var folder = {
    thumb: 'public/upload/gallery/thumb/',
    upload: 'public/upload/gallery/image/'
};

mkdirp.sync(folder.thumb);
mkdirp.sync(folder.upload);

function index(req, res) {
    var params = {
        title: 'Gallery'
    };

    res.render(BLITITOR.config.site.theme + '/page/gallery', params);
}

function uploadImage(req, res) {
    // Check if upload failed or was aborted
    if (req.files[0] && req.files[0].fieldname == 'files') {
        var file = req.files[0];

        processFile(file, function (err) {
            if (err) {
                return res.send({ errors: [err] });
            } else {
                return res.send(file);
            }
        });
    } else {
        return res.send({ errors: ['no file exist'] });
    }
}

function saveImage(req, res) {
    var post = {
        image: req.body['image'],
        path: req.body['path'],
        thumbnail: req.body['thumb'],
        message: req.body['message'] || '',
        email: req.body['email'],
        access_ip: req.ip
    };

    console.log(post);
    // database.save(post, function () {
        return res.redirect('back');
    // });
}

module.exports = {
    // index: index,
    uploadImage: uploadImage,
    createItem: saveImage
};

function processFile(file, callback) {
    var path = file.path.split('/');
    var name = path[path.length - 1];

    // thumbnail
    imageProcessor.open(file.path, function (error, image) {
        image.cover(size.width, size.height, function (err, image) {
            if (err) {
                callback(err);
            } else {
                image.writeFile(folder.thumb + name, function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        // move file to upload folder
                        callback();
                    }
                });
            }
        });
    });

    // resize
    imageProcessor.open(file.path, function (error, image) {
        var h, w, r, m;

        m = 1200;
        w = image.width();
        h = image.height();
        r = h / w;

        //console.log(image, w, h, r);

        if (w > m) {
            image.resize(m, h - Math.floor((w - m) * r), function (err, image) {
                w = image.width();
                h = image.height();
                r = w / h;

                //console.log(image, w, h, r);

                if (h > m) {
                    image.resize(w - Math.floor((h - m) * r), m, function (err, image) {
                        image.writeFile(folder.upload + name, function (err) {
                            console.log('upload done resize w, h');
                        });
                    });
                } else {
                    image.writeFile(folder.upload + name, function (err) {
                        console.log('upload done resize w');
                    });
                }
            });
        } else {
            if (h > m) {
                r = w / h;

                //console.log(image, w, h, r);

                image.resize(w - Math.floor((h - m) * r), m, function (err, image) {
                    image.writeFile(folder.upload + name, function (err) {
                        console.log('upload done resize h');
                    });
                });
            } else {
                image.writeFile(folder.upload + name, function (err) {
                    console.log('upload done resize nothing');
                });
            }
        }
    });
}

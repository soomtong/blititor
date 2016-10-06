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

function imageList(req, res) {
    var params = {
        category: req.params['cate'] || 1,
        xhr: req.xhr || false
    };

    var mysql = connection.get();

    db.readGalleryImageList(mysql, params, function (error, result) {
        return res.send(result);
    });
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
    var params = {
        image: req.body['image'],
        path: req.body['path'],
        thumbnail: req.body['thumb'],
        message: req.body['message'] || '',
        category: req.body['category'] || 0
    };

    console.log(params);

    var mysql = connection.get();

    db.createGalleryImageItem(mysql, params, function (err, result) {
        if (err) {
            req.flash('error', {msg: err});

            winston.error(err);

            return res.redirect('back');
        }

        winston.warn('Inserted gallery image:', result);

        return res.redirect('back');
    });
}

module.exports = {
    // index: index,
    imageList: imageList,
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
                            // console.log('upload done resize w, h');
                        });
                    });
                } else {
                    image.writeFile(folder.upload + name, function (err) {
                        // console.log('upload done resize w');
                    });
                }
            });
        } else {
            if (h > m) {
                r = w / h;

                //console.log(image, w, h, r);

                image.resize(w - Math.floor((h - m) * r), m, function (err, image) {
                    image.writeFile(folder.upload + name, function (err) {
                        // console.log('upload done resize h');
                    });
                });
            } else {
                image.writeFile(folder.upload + name, function (err) {
                    // console.log('upload done resize nothing');
                });
            }
        }
    });
}

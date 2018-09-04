const fs = require('fs');
const path = require('path');
const async = require('neo-async');
const winston = require('winston');
const jimp = require('jimp');
const sharp = require('sharp');

const common = require('../../../core/lib/common');
const misc = require('../../../core/lib/misc');
const connection = require('../../../core/lib/connection');

const db = require('./database');

const routeTable = misc.getRouteData();

const folder = {
    thumb: path.join('public', 'upload', 'gallery', 'thumb'),
    upload: path.join('public', 'upload', 'gallery', 'image')
};

misc.makeGalleryFolders(folder);

function galleryImages(req, res) {
    const params = {
        galleryImageList: []
    };

    const mysql = connection.get();

    db.readAllCategories(mysql, function (error, result) {
        params.cateList = result || [];

        db.readAllImages(mysql, function (error, result) {
            params.imageList = result || [];

            // make map data with category
            params.cateList.map(category => {
                category.images = params.imageList.filter(image => {
                    return image.category === category.id;
                });

                params.galleryImageList.push(category);
            });

            res.render(BLITITOR.site.theme + '/page/gallery/list', params);
        });
    });
}

function createCategory(req, res) {
    const params = {
        title: req.body['category'] || ''
    };

    const mysql = connection.get();

    db.createCategory(mysql, params, function (error, result) {
        if (error) {
            winston.error('gallery category insert error ' + error)
        }

        winston.info('created gallery category with id: ' + result.insertId);

        res.redirect(routeTable.gallery.root)
    });
}

function imageList(req, res) {
    const params = {
        category: req.params['cate'] || 1,
        xhr: req.xhr || false
    };

    const mysql = connection.get();

    db.readGalleryImageList(mysql, params, function (error, result) {
        return res.send(result);
    });
}

function categoryList(req, res) {
    const params = {};

    const mysql = connection.get();

    db.readGalleryCategory(mysql, function (error, result) {
        params.cateList = result || [];

        res.render(BLITITOR.site.theme + '/page/gallery/list', params);
    });
}

function uploadImage(req, res) {
    if (req.files && req.files[0] && req.files[0].fieldname === 'file') {
        winston.info('file uploading: ' + req.files[0].filename);

        const uploadedImage = req.files[0];
        const imageParams = req.body;

        processImageWithSharp(uploadedImage, function (error) {
            if (error) {
                res.send(error);
            } else {
                const galleryImageData = {
                    path: uploadedImage.path,
                    imageName: uploadedImage.originalname,
                    imageFile: uploadedImage.filename,
                    message: imageParams['title'] || '',
                    category: Number(imageParams['category']) || 0
                };

                const mysql = connection.get();

                db.createGalleryImageItem(mysql, galleryImageData, function (err, result) {
                    if (err) {
                        winston.error(err);
                    }

                    res.send(galleryImageData);
                });
            }
        });
    } else {
        winston.error('file uploading error: ' + req.files);

        res.send('');
    }
}

function uploadImage2(req, res) {
    // Check if upload failed or was aborted
    // console.log(req.files);

    if (req.files[0] && req.files[0].fieldname == 'files') {
        const file = req.files[0];

        processFileWithJIMP(file, function (err) {
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

function createImageItem(req, res) {
    const params = {
        image: req.body['image'],
        path: req.body['path'],
        thumbnail: req.body['thumb'],
        message: req.body['message'] || '',
        category: req.body['category'] || 0
    };

    const mysql = connection.get();

    if (Array.isArray(params.image)) {
        params.image.map(function (item, idx) {
            // console.log(item, idx);

            const imageFile = {
                image: params.image[idx],
                path: params.path[idx],
                thumbnail: params.thumbnail[idx],
                message: params.message || '',
                category: params.category[idx] || 0
            };

            db.createGalleryImageItem(mysql, imageFile, function (err, result) {
                if (err) {
                    winston.error(err);
                }
            });
        });

        winston.warn('Inserted gallery images:', params.image.length);

        return res.redirect('back');

    } else {
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
}

module.exports = {
    images: galleryImages,
    createCategory: createCategory,
    imageList: imageList,
    categoryList: categoryList,
    uploadImage: uploadImage,
    uploadImage2: uploadImage2,
    createImageItem: createImageItem
};

function processFileWithJIMP(file, callback) {
    const name = file.filename;

    const marginWidth = 1200;
    const marginHeight = 1800;
    const thumbnailSize = {
        width: 80,
        height: 60
    };

    jimp.read(file.path, function (err, image) {
        if (err) {
            winston.error('Image Process Error', err);

            return callback(err);
        }

        // make resize by case
        if (image.bitmap.width > marginWidth) {
            if (image.bitmap.height > marginHeight) {
                image.resize(imageProcessor.AUTO, marginHeight).write(path.join(folder.upload, name));
            } else {
                image.resize(marginWidth, imageProcessor.AUTO).write(path.join(folder.upload, name));
            }
        } else if (image.bitmap.height > marginHeight * 2) {
            image.resize(imageProcessor.AUTO, marginHeight).write(path.join(folder.upload, name));
        } else {
            image.quality(80).write(path.join(folder.upload, name));
        }

        // make thumbnail
        image.cover(thumbnailSize.width, thumbnailSize.height)
            .quality(80)
            .write(path.join(folder.thumb, name), function (err) {
                if (err) callback(err);
                else callback();
            });
    });
}

function processImageWithSharp(file, callback) {
    const name = file.filename;

    const resizeOpt = {
        width: 1600,
        height: 1800,
        type: 'jpeg',
        quality: 95
    };
    const thumbnailOpt = {
        width: 80,
        height: 60,
        entropy: sharp.strategy.entropy
    };

    const image1 = sharp(file.path);

    image1.metadata(function (error, data) {
        // calculate image aspect and resize if image size is over
        if (data.width > resizeOpt.width) {
            if (image1.height > resizeOpt.height) {
                image1.resize(null, resizeOpt.height);
            } else {
                image1.resize(resizeOpt.width, null);
            }
        } else if (data.height > resizeOpt.height * 2) {
            image1.resize(null, resizeOpt.height);
        }

        image1.toFormat(resizeOpt.type, { quality: resizeOpt.quality })
            .toFile(path.join(folder.upload, name), (error, info) => {
                // early callback. it's intended
                callback(error, info);

                winston.info('image resize: ' + info);

                image1.resize(thumbnailOpt.width, thumbnailOpt.height).crop(thumbnailOpt.entropy)
                    .toFormat('jpeg').toFile(path.join(folder.thumb, name), (error, info) => {
                    if (error) {
                        winston.error('make thumbnail from image: ' + error);
                    }

                    winston.info('make thumbnail from image: ' + info);
                });
            });
    });
}
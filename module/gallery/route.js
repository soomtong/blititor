var express = require('express');
// var jqueryFileUploader = require('jfum');

var misc = require('../../core/lib/misc');

var gallery = require('./lib/gallery');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteTable();

/*
var uploader = new jqueryFileUploader({
    minFileSize:    2048,                      //  20 kB
    maxFileSize: 5242880,                     // 5000 kB
    acceptFileTypes: /\.(gif|jpe?g|png)$/i    // gif, jpg, jpeg, png
});
*/

router.use(middleware.exposeLocals);

// router.get(routeTable.gallery.form, gallery.index);
router.post(routeTable.gallery.upload, AccountMiddleware.checkSignedIn, gallery.createItem);
router.post(routeTable.gallery.upload + '/image', AccountMiddleware.checkSignedIn, gallery.uploadImage);

module.exports = router;
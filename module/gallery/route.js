const express = require('express');

const misc = require('../../core/lib/misc');
const { checkManager } = require('../account/lib/middleware');

const gallery = require('./lib/gallery');
const middleware = require('./lib/middleware');

const routeTable = misc.getRouteData();
const site = express.Router();

site.use(middleware.exposeLocals);
site.get(routeTable.gallery.list, gallery.images);
site.post(routeTable.gallery.category, checkManager, gallery.createCategory);
site.post(routeTable.gallery.image, checkManager, gallery.uploadImage);

const manage = express.Router();

manage.get(routeTable.gallery.list, gallery.categoryList);
manage.get(routeTable.gallery.image + '/:cate', gallery.imageList);
manage.post(routeTable.gallery.upload, checkManager, gallery.createImageItem);
manage.post(routeTable.gallery.upload + '/image', checkManager, gallery.uploadImage2);

module.exports = {
    site,
    manage
};
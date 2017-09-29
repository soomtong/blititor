var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var manager = require('./lib/manager');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteTable();

// caution. when use each middleware for other module's router. it affects all router that exist behind
router.get(routeTable.manage_root + routeTable.manage.login, manager.loginForm);
router.post(routeTable.manage_root + routeTable.manage.login, manager.loginProcess);

// for counter
router.all(routeTable.manage_root,                                 AccountMiddleware.checkManager, manager.dashboard);
router.all(routeTable.manage_root + routeTable.manage.pageCounter, AccountMiddleware.checkManager, manager.pageViewCounter);
router.get(routeTable.manage_root + routeTable.manage.pageLog, AccountMiddleware.checkManager, manager.pageViewLog);
// for account
router.get(routeTable.manage_root + routeTable.manage.account, AccountMiddleware.checkManager, manager.accountList);
router.get(routeTable.manage_root + routeTable.manage.accountCounter, AccountMiddleware.checkManager, manager.accountActionCounter);
// for guestbook
router.get(routeTable.manage_root + routeTable.guestbook_root, AccountMiddleware.checkManager, manager.guestbookList);
router.post(routeTable.manage_root + routeTable.guestbook_root + routeTable.guestbook.reply, AccountMiddleware.checkManager, manager.guestbookReply);
router.post(routeTable.manage_root + routeTable.guestbook_root + routeTable.guestbook.delete, AccountMiddleware.checkManager, manager.guestbookDelete);
// for gallery
router.get(routeTable.manage_root + routeTable.manage.gallery, AccountMiddleware.checkManager, manager.galleryManager);
router.post(routeTable.manage_root + routeTable.manage.galleryImageSort, AccountMiddleware.checkManager, manager.galleryImageSort);
router.post(routeTable.manage_root + routeTable.manage.galleryImageRemove, AccountMiddleware.checkManager, manager.galleryImageDelete);
router.post(routeTable.manage_root + routeTable.manage.galleryCategory, AccountMiddleware.checkManager, manager.galleryCategory);
router.get(routeTable.manage_root + routeTable.manage.galleryImage, AccountMiddleware.checkManager, manager.galleryImageList);
// for reservation
router.get(routeTable.manage_root + routeTable.manage.reservation, AccountMiddleware.checkManager, manager.reservationList);
router.get(routeTable.manage_root + routeTable.manage.reservationClean, AccountMiddleware.checkManager, manager.reservationListFull);
router.get(routeTable.manage_root + routeTable.manage.tutorial, AccountMiddleware.checkManager, manager.reservationStatus);
router.get(routeTable.manage_root + routeTable.manage.tutorialStatus, AccountMiddleware.checkManager, manager.reservationTutorialStatus);

module.exports = router;
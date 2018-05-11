var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var manager = require('./lib/manager');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteData();

// caution. when use each middleware for other module's router. it affects all router that exist behind
router.get(routeTable.manage.login, manager.loginForm);
router.post(routeTable.manage.login, manager.loginProcess);
// for dashboard
router.get(routeTable.manage.dashboard, AccountMiddleware.checkManager, manager.dashboard);
// for counter
router.get('/', AccountMiddleware.checkManager, manager.index);
router.get(routeTable.manage.pageCounter, AccountMiddleware.checkManager, manager.pageViewCounter);
router.get(routeTable.manage.pageLog, AccountMiddleware.checkManager, manager.pageViewLog);
// for account
router.get(routeTable.manage.account, AccountMiddleware.checkManager, manager.accountList);
router.get(routeTable.manage.accountCounter, AccountMiddleware.checkManager, manager.accountActionCounter);
// for guestbook
router.get('/guestbook', AccountMiddleware.checkManager, manager.guestbookList);
router.post(routeTable.guestbook.reply, AccountMiddleware.checkManager, manager.guestbookReply);
router.post(routeTable.guestbook.delete, AccountMiddleware.checkManager, manager.guestbookDelete);
// for gallery
router.get(routeTable.manage.gallery, AccountMiddleware.checkManager, manager.galleryManager);
router.post(routeTable.manage.galleryImageSort, AccountMiddleware.checkManager, manager.galleryImageSort);
router.post(routeTable.manage.galleryImageRemove, AccountMiddleware.checkManager, manager.galleryImageDelete);
router.post(routeTable.manage.galleryCategory, AccountMiddleware.checkManager, manager.galleryCategory);
router.get(routeTable.manage.galleryImage, AccountMiddleware.checkManager, manager.galleryImageList);
// for reservation
router.get(routeTable.manage.reservation, AccountMiddleware.checkManager, manager.reservationList);
router.get(routeTable.manage.reservationClean, AccountMiddleware.checkManager, manager.reservationListFull);
router.get(routeTable.manage.tutorial, AccountMiddleware.checkManager, manager.reservationStatus);
router.get(routeTable.manage.tutorialStatus, AccountMiddleware.checkManager, manager.reservationTutorialStatus);

module.exports = router;
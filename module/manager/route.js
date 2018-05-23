var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var manager = require('./lib/manager');
var middleware = require('./lib/middleware');

var Account = require('../account');

var router = express.Router();
var routeTable = misc.getRouteData();

router.use(Account.middleware.exposeLocals);
// caution. when use each middleware for other module's router. it affects all router that exist behind
router.get(routeTable.manage.login, manager.loginForm);
router.post(routeTable.manage.login, manager.loginProcess);
// for dashboard
router.get(routeTable.manage.dashboard, Account.middleware.checkManager, manager.dashboard);
// for counter
router.get('/', Account.middleware.checkManager, manager.index);
router.get(routeTable.manage.pageCounter, Account.middleware.checkManager, manager.pageViewCounter);
router.get(routeTable.manage.pageLog, Account.middleware.checkManager, manager.pageViewLog);
// for account
router.get(routeTable.manage.account, Account.middleware.checkManager, manager.accountList);
router.get(routeTable.manage.accountCounter, Account.middleware.checkManager, manager.accountActionCounter);
// for guestbook
router.get('/guestbook', Account.middleware.checkManager, manager.guestbookList);
router.post('/guestbook' + routeTable.guestbook.reply, Account.middleware.checkManager, manager.guestbookReply);
router.post('/guestbook' + routeTable.guestbook.delete, Account.middleware.checkManager, manager.guestbookDelete);
// for gallery
router.get(routeTable.manage.gallery, Account.middleware.checkManager, manager.galleryManager);
router.post(routeTable.manage.galleryImageSort, Account.middleware.checkManager, manager.galleryImageSort);
router.post(routeTable.manage.galleryImageRemove, Account.middleware.checkManager, manager.galleryImageDelete);
router.post(routeTable.manage.galleryCategory, Account.middleware.checkManager, manager.galleryCategory);
router.get(routeTable.manage.galleryImage, Account.middleware.checkManager, manager.galleryImageList);
// for reservation
router.get(routeTable.manage.reservation, Account.middleware.checkManager, manager.reservationList);
router.get(routeTable.manage.reservationClean, Account.middleware.checkManager, manager.reservationListFull);
router.get(routeTable.manage.tutorial, Account.middleware.checkManager, manager.reservationStatus);
router.get(routeTable.manage.tutorialStatus, Account.middleware.checkManager, manager.reservationTutorialStatus);

module.exports = router;

const express = require('express');
const winston = require('winston');

const misc = require('../../core/lib/misc');

const manager = require('./lib/manager');
const middleware = require('./lib/middleware');

const Account = require('../account');
const Notice = require('../notice');

const router = express.Router();
const routeTable = misc.getRouteData();

router.use(Account.middleware.exposeLocals);

router.get(routeTable.manage.login, manager.loginForm);
router.post(routeTable.manage.login, manager.loginProcess);

router.use(Account.middleware.checkManager);

router.get(routeTable.manage.home, manager.index);
router.get(routeTable.manage.dashboard, manager.dashboard); // for ajax dashboard
// for counter
router.get(routeTable.manage.pageLog, manager.pageViewLog);
router.get(routeTable.manage.pageCounter, manager.pageViewCounter);
// for account
router.get(routeTable.manage.account, manager.accountList);
router.get(routeTable.manage.accountCounter, manager.accountActionCounter);

//todo: move each module features to module's router. like this.
router.use(routeTable.notice.root, Notice.manage);

//todo: update like notice module
// for guestbook
router.get(routeTable.guestbook.root, manager.guestbookList);
router.post(routeTable.guestbook.root + routeTable.guestbook.reply, manager.guestbookReply);
router.post(routeTable.guestbook.root + routeTable.guestbook.delete, manager.guestbookDelete);
// for gallery
router.get(routeTable.manage.gallery, manager.galleryManager);
router.post(routeTable.manage.galleryImageSort, manager.galleryImageSort);
router.post(routeTable.manage.galleryImageRemove, manager.galleryImageDelete);
router.post(routeTable.manage.galleryCategory, manager.galleryCategory);
router.get(routeTable.manage.galleryImage, manager.galleryImageList);
// for reservation
router.get(routeTable.manage.reservation, manager.reservationList);
router.get(routeTable.manage.reservationClean, manager.reservationListFull);
router.get(routeTable.manage.tutorial, manager.reservationStatus);
router.get(routeTable.manage.tutorialStatus, manager.reservationTutorialStatus);

module.exports = router;

const express = require('express');
const winston = require('winston');

const misc = require('../../core/lib/misc');

const manager = require('./lib/manager');
const middleware = require('./lib/middleware');

const Account = require('../account');
const Notice = require('../notice');

const routeTable = misc.getRouteData();
const site = express.Router();

site.use(Account.middleware.exposeLocals);

site.get(routeTable.manage.login, manager.loginForm);
site.post(routeTable.manage.login, manager.loginProcess);

const manage = express.Router();

manage.use(Account.middleware.checkManager);

manage.get(routeTable.manage.home, manager.index);
manage.get(routeTable.manage.dashboard, manager.dashboard); // for ajax dashboard
// for counter
manage.get(routeTable.manage.pageLog, manager.pageViewLog);
manage.get(routeTable.manage.pageCounter, manager.pageViewCounter);
// for account
manage.get(routeTable.manage.account, manager.accountList);
manage.get(routeTable.manage.accountCounter, manager.accountActionCounter);

//todo: move each module features to module's router. like this.
manage.use(routeTable.notice.root, Notice.manage);

//todo: update like notice module
// for guestbook
manage.get(routeTable.guestbook.root, manager.guestbookList);
manage.post(routeTable.guestbook.root + routeTable.guestbook.reply, manager.guestbookReply);
manage.post(routeTable.guestbook.root + routeTable.guestbook.delete, manager.guestbookDelete);
// for gallery
manage.get(routeTable.manage.gallery, manager.galleryManager);
manage.post(routeTable.manage.galleryImageSort, manager.galleryImageSort);
manage.post(routeTable.manage.galleryImageRemove, manager.galleryImageDelete);
manage.post(routeTable.manage.galleryCategory, manager.galleryCategory);
manage.get(routeTable.manage.galleryImage, manager.galleryImageList);
// for reservation
manage.get(routeTable.manage.reservation, manager.reservationList);
manage.get(routeTable.manage.reservationClean, manager.reservationListFull);
manage.get(routeTable.manage.tutorial, manager.reservationStatus);
manage.get(routeTable.manage.tutorialStatus, manager.reservationTutorialStatus);

module.exports = {
    site,
    manage
};

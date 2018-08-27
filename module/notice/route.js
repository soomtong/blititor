const express = require('express');

const misc = require('../../core/lib/misc');
const { checkManager } = require('../account/lib/middleware');

const notice = require('./lib/notice');
const middleware = require('./lib/middleware');

const routeTable = misc.getRouteData();
const site = express.Router();

site.use(middleware.exposeLocals);
site.get(routeTable.notice.list, notice.list);
site.post(routeTable.notice.list, checkManager, notice.control);
site.get(routeTable.notice.update + '/:id', checkManager, notice.updateForm);
site.post(routeTable.notice.update + '/:id', checkManager, notice.update);
site.get(routeTable.notice.write, checkManager, notice.writeForm);
site.post(routeTable.notice.write, checkManager, notice.write);

const manage = express.Router();

manage.get(routeTable.notice.manage, notice.manageHome);
manage.post(routeTable.notice.manage, notice.manage);

module.exports = { site, manage };
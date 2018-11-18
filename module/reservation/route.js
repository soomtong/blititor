const express = require('express');

const misc = require('../../core/lib/misc');

const reservation = require('./lib/reservation');
const middleware = require('./lib/middleware');

const routeTable = misc.getRouteData();
const site = express.Router();

site.use(middleware.exposeLocals);

site.get(routeTable.reservation['form'] + '/:cate?', reservation.form);
site.post(routeTable.reservation['form'], reservation.register);
site.get(routeTable.reservation['status'], reservation.status);
site.post(routeTable.reservation['phone_secret'], reservation.sendSecret);

const manage = express.Router();

manage.get(routeTable.reservation['manage'], reservation.manageHome);
manage.post(routeTable.reservation['manage'], reservation.manage);
manage.get(routeTable.reservation['clean_list'], reservation.manageFullList);

module.exports = { site, manage };
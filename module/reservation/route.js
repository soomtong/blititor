var express = require('express');

var misc = require('../../core/lib/misc');

var reservation = require('./lib/reservation');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');
var CounterMiddleware = require('../counter/lib/middleware');

var router = express.Router();
var routeTable = misc.getRouteTable();

router.use(middleware.exposeLocals);

router.get(routeTable.reservation.form, reservation.form);
router.post(routeTable.reservation.form, reservation.register);
router.get(routeTable.reservation.status, reservation.status);
router.post(routeTable.reservation.phoneSecret, reservation.sendSecret);

module.exports = router;
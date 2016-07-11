var express = require('express');

var router = express.Router();

var guestbook = require('./lib/guestbook');
var middleware = require('./lib/middleware');

var AccountMiddleware = require('../account/lib/middleware');

var routeTable = BLITITOR.route;

router.use(middleware.exposeLocals);

router.get(routeTable.guestbook.form, guestbook.guestbook);
router.get(routeTable.guestbook.form + ':page', guestbook.guestbook);
router.post(routeTable.guestbook.message, guestbook.registerMessage);
router.post(routeTable.guestbook.reply, AccountMiddleware.checkSignedIn ,guestbook.registerReply);

module.exports = router;
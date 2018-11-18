const express = require('express');

const misc = require('../../core/lib/misc');

const guestbook = require('./lib/guestbook');
const middleware = require('./lib/middleware');

const AccountMiddleware = require('../account/lib/middleware');

const site = express.Router();
const routeTable = misc.getRouteData();

site.use(middleware.exposeLocals);

site.get(routeTable.guestbook.form, guestbook.guestbook);
site.get(routeTable.guestbook.form + ':page', guestbook.guestbook);
site.post(routeTable.guestbook.message, guestbook.registerMessage);
site.post(routeTable.guestbook.reply, AccountMiddleware.checkSignedIn ,guestbook.registerReply);

module.exports = {
    site
};

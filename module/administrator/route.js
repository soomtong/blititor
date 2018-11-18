const express = require('express');
const winston = require('winston');

const misc = require('../../core/lib/misc');

const administrator = require('./lib/administrator');
const middleware = require('./lib/middleware');

const Account = require('../account');

const routeTable = misc.getRouteData();
const site = express.Router();

site.use(Account.middleware.exposeLocals);

site.get(routeTable.admin['login'], administrator.loginForm);
site.post(routeTable.admin['login'], administrator.loginProcess);

// caution. use each middleware for other module's router. it affects all router exist behind
const admin = express.Router();

admin.get(routeTable.admin['home'], Account.middleware.checkAdministrator, administrator.accountList);
admin.get(routeTable.admin['account'], Account.middleware.checkAdministrator, administrator.accountList);
admin.get(routeTable.admin['account_new'], Account.middleware.checkAdministrator, administrator.accountView);
admin.post(routeTable.admin['account_add'], Account.middleware.checkAdministrator, Account.registerSimple);

admin.get(routeTable.admin['account'] + '/:uuid', Account.middleware.checkAdministrator, administrator.accountView);
admin.get(routeTable.admin['account_edit'] + '/:uuid', Account.middleware.checkAdministrator, administrator.accountForm);
admin.post(routeTable.admin['account_edit'] + '/:uuid', Account.middleware.checkAdministrator, administrator.accountProcess);

module.exports = { site, admin };
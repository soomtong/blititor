// todo: move to page module, site module

var winston = require('winston');
var common = require('../../core/lib/common');
var site = require('../site/lib/site');
var account = require('../account/lib/account');

module.exports = {
    index: site.index,
    blog: site.pages,
    about: site.pages,
    write: site.pages,
    pages: site.pages,
    sign_in: account.signIn,
    sign_up: account.signUp,
    sign_out: account.signOut,
};
var fs = require('fs');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');

var Account = require('../../account');

var db = require('./database');

function index(req, res) {
    var params = {
        title: 'Gallery'
    };

    res.render(BLITITOR.config.site.theme + '/page/gallery', params);
}

module.exports = {
    // index: index,
};
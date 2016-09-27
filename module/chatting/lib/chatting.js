var fs = require('fs');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules

function index(req, res) {
    var params = {
        title: 'chatting'
    };
    res.render(BLITITOR.config.site.theme + '/page/chatting', params);
}

module.exports = {
    index: index
};
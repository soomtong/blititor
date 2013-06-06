process.on('uncaughtException', function (err) {
    console.error('Caught exception: ' + err['stack']);
});

var config = require('../config');
var mongoskin = require('mongoskin');
var mongoConf = config['mongoConf'];

exports.getConfig = function () {
    return config;
};
exports.setConfig = function (config) {
    console.log(config);
};

//exports.mongodb = mongoskin.db(mongoConf.auth.user + ':' + mongoConf.auth.pass + '@' + mongoConf.host + ':' + mongoConf.port + '/' + mongoConf.database, {safe:false});
exports.mongodb = mongoskin.db(mongoConf.host + ':' + mongoConf.port, {
    username: mongoConf.auth.user,
    password: mongoConf.auth.pass,
    database: mongoConf.database,
    safe: false
});

exports.validateEmail = function (email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

exports.formatDateTime = function (d) {
    var pad = function (n) {
    	var s = "0" + n;
    	return s.substr(s.length - 2, 2);
    };

	return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
};

exports.getPageParams = function (totalCount, nowPage, pageSize, pageGutter) {
    var params = {};

    params.totalCount = totalCount;
    params.lineCounter = totalCount - ( pageSize * (nowPage - 1));
    params.totalPages = parseInt(totalCount / pageSize) + (totalCount % pageSize ? 1 : 0);

    params.startPage = params.totalPages > pageGutter * 2 && nowPage - pageGutter > 0 ? nowPage - pageGutter - (pageGutter + nowPage - params.totalPages > 0 ? pageGutter + nowPage - params.totalPages : 0) : 1;
    params.endPage = params.totalPages > pageGutter * 2 && nowPage + pageGutter < params.totalPages ? nowPage + pageGutter + (pageGutter - nowPage > 0 ? pageGutter - nowPage : 0) : params.totalPages;

    return params;
};
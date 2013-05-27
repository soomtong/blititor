var mongoskin = require('mongoskin');
var mongoConf = (require('./config').get()).mongoConf;

process.on('uncaughtException', function (err) {
    console.error('Caught exception: ' + err);
});

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
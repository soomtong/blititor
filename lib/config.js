var fs = require('fs');
/*
module.exports = (function () {
    return JSON.parse(fs.readFileSync('./config.json', 'utf8'));
})();
*/

exports.get = function () {
    return JSON.parse(fs.readFileSync('./config.json', 'utf8'));
};
exports.set = function (config) {
    console.log(config);
};

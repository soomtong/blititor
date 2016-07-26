var uuid = require('uuid');
var bcrypt = require('bcrypt');
var removeMarkdown = require('remove-markdown');
var moment = require('moment');

var databaseConfiguration = require('../config/database_default');

var salt = bcrypt.genSaltSync(8);

function destructMarkdown(markdownText) {
    var title = markdownText.toString().match(/^##[^#].+/m)[0].trim();
    var quote = markdownText.toString().match(/^>.+/m)[0].trim();
    var credit = markdownText.toString().match(/^###[^#].*redit(.|\n)*/igm)[0].trim().split('\n');
    // console.log('markdown:',credit, credit.slice(1));

    return {
        title: title.substring(title.indexOf('##') + 2).trim(),
        quote: quote.substring(quote.indexOf('>') + 1).trim(),
        credit: credit.slice(1).join('').trim()
    };
}

function regexFilter() {
    return {
        page: /\/([^\/]+)\/?$/
    };
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString(len) {
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charLen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charLen - 1)]);
    }

    return buf.join('');
}

// todo: customize errorFormatter()
function errorFormatter(param, msg, value) {
    var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

    while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
    }
    return {
        param : formParam,
        msg   : msg,
        value : value
    };
}

function getUUID1() {
    return uuid.v1();
}

function getUUID4() {
    return uuid.v4();
}

function getHash(password, callback) {
    if (!callback || typeof callback !== 'function') {
        return bcrypt.hashSync(password, salt);
    } else {
        return bcrypt.hash(password, salt, callback);
    }
}

function getHeaderTextFromMarkdown(markdown, limit) {
    var arr = markdown.split(/\r*\n/), len = arr.length;
    var text = [];

    limit = limit || 30;

    for (var i = 0; i < len; i++) {
        var temp = '';

        temp = removeMarkdown(arr[i]);

        if (temp) {
            text.push(temp);
        }

        // check count length
        if (text.join('\n').length > limit) break;
    }

    return text.join('\n').substr(0, limit).trim();
}

function getDatabaseDefault() {
    return databaseConfiguration;
}

function dateFormatter(dateValue) {
    return !(dateValue && dateValue.toString().indexOf('0000') < 0) ? moment(Date.now()).format("YYYY-MM-DD") : moment(dateValue).format("YYYY-MM-DD");
}

module.exports = {
    dateFormatter: dateFormatter,
    errorFormatter: errorFormatter,
    destructMarkdown: destructMarkdown,
    regexFilter: regexFilter,
    randomString: randomString,
    UUID1: getUUID1,
    UUID4: getUUID4,
    hash: getHash,
    getHeaderTextFromMarkdown: getHeaderTextFromMarkdown,
    databaseDefault: getDatabaseDefault()
};
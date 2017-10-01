var uuid = require('uuid');
var bcrypt = require('bcryptjs');
var removeMarkdown = require('remove-markdown');
var moment = require('moment');

var databaseConfiguration = require('../config/database_default');

var salt = bcrypt.genSaltSync(8);

function destructMarkdown(markdownText) {
    var title = markdownText.toString().match(/^##[^#].+/m)[0].trim();
    var quote = markdownText.toString().match(/^>.+/m)[0].trim();
    var credit = markdownText.match(/^###[^#].*redit(\n|\r)(\n|\r)(.|\n|\r)*/igm)[0].trim().split('\n');
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

function randomNumber(len) {
    var buf = [],
        chars = '0123456789',
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

function getUUID1(mark) {
    if (!mark) {
        mark = '';
    }

    return uuid.v1().replace(/-/g, mark);
}

function getUUID4(mark) {
    if (!mark) {
        mark = '';
    }

    return uuid.v4().replace(/-/g, mark);
}

function getHash(password, callback) {
    if (!callback || typeof callback !== 'function') {
        return bcrypt.hashSync(password, salt);
    } else {
        return bcrypt.hash(password, salt, callback);
    }
}

function getHeaderTextFromMarkdown(markdown, limit, joiner) {
    var arr = markdown.split(/\r*\n/);
    var len = arr.length;
    var text = [];
    var reduced = '';

    limit = limit || 30;

    for (var i = 0; i < len; i++) {
        var temp = '';

        temp = removeMarkdown(arr[i]);

        if (temp) {
            text.push(temp);
        }

        // check count length
        if (text.join('\n').length > limit) {
            reduced = ' ...';
            break;
        }
    }

    return joiner ? text.join(joiner).substr(0, limit).trim() + reduced : text.join('\n').substr(0, limit).trim() + reduced;
}

function getHeaderTextFromDelta(delta, limit, joiner) {
    var arr = JSON.parse(delta)['ops'];
    var len = arr.length;
    var text = [];
    var reduced = '';

    limit = limit || 30;

    for (var i = 0; i < len; i++) {
        var temp = '';
        temp = arr[i]['insert'];

        if (temp) {
            text.push(temp);
        }

        if (text.join('\n').length > limit) {
            reduced = ' ...';
            break;
        }
    }

    return joiner ? text.join(joiner).substr(0, limit).trim() + reduced : text.join('\n').substr(0, limit).trim() + reduced;
}

function getDatabaseDefault() {
    return databaseConfiguration;
}

function dateFormatter(dateValue, format, fillDefault) {
    if (!format) format = "YYYY-MM-DD";
    if (!fillDefault) fillDefault = false;

    return dateValue ? moment(dateValue).format(format) : (fillDefault ? moment(Date.now()).format(format) : '');
}

function pageFormatter(url) {
    if (typeof url != 'string') url = url.toString();

    var len = url.length;

    if (url.lastIndexOf('/') == len - 1) url = url.substr(0, len - 1);
    if (url.indexOf('https://') == 0) url = url.substr(7);
    if (url.indexOf('http://') == 0) url = url.substr(6);

    return url;
}

function pagination (pageIndex, totalCount, PAGE_SIZE, GUTTER_SIZE, GUTTER_MARGIN) {
    var params = {
        page: Math.abs(Number(pageIndex)) || 1,
        index: 0,
        maxPage: 0,
        pageSize: PAGE_SIZE
    };

    var maxPage = Math.ceil(totalCount / PAGE_SIZE);

    if (maxPage < params.page) params.page = maxPage;

    params.maxPage = maxPage;
    params.index = (params.page - 1) * PAGE_SIZE;

    if (params.index < 0) params.index = 0;

    params.hasNext = totalCount > ((params.page) * PAGE_SIZE);
    params.hasPrev = params.index > 0;

    if (params.maxPage > GUTTER_SIZE) {
        params.preIndex = getPreIndex(params.page, params.maxPage, GUTTER_MARGIN);
        params.postIndex = getPostIndex(params.page, params.maxPage, GUTTER_MARGIN);
    }

    return params;

    function getPreIndex(page, maxPage, gutterMargin) {
        if (page < gutterMargin * 2) {
            return 0
        } else {
            return (page - gutterMargin) + (gutterMargin * 2) > maxPage
                ? maxPage - (gutterMargin * 2) : page - gutterMargin
        }
    }

    function getPostIndex(page, maxPage, gutterMargin) {
        if (page > maxPage - gutterMargin) {
            return maxPage
        } else {
            return (page + gutterMargin) < (gutterMargin * 2)
                ? gutterMargin * 2 + 1 : page + gutterMargin + 1
        }
    }
}

function splitString2Array(str, delimiter) {
    if (!str) return [];
    else return str.split(delimiter).map(function (tag) {
        return tag.trim();
    }).filter(function (tag) {
        return !!tag;
    });
}

module.exports = {
    pagination: pagination,
    pageFormatter: pageFormatter,
    dateFormatter: dateFormatter,
    errorFormatter: errorFormatter,
    destructMarkdown: destructMarkdown,
    regexFilter: regexFilter,
    randomString: randomString,
    randomNumber: randomNumber,
    UUID1: getUUID1,
    UUID4: getUUID4,
    hash: getHash,
    getHeaderTextFromMarkdown: getHeaderTextFromMarkdown,
    getHeaderTextFromDelta: getHeaderTextFromDelta,
    splitString2Array: splitString2Array,
    databaseDefault: getDatabaseDefault()
};
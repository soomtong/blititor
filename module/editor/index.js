// var route = require('./route');
// var middleware = require('./lib/middleware');

var express = require('express');
var winston = require('winston');

var router = express.Router();

// router.use(middleware.exposeLocals);

router.get('/editor.js', function (req, res, next) {
    res.send('console.log("say hello");');
});

module.exports = {
    route: router,
    // middleware: middleware
};

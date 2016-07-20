var express = require('express');
var winston = require('winston');

var misc = require('../../core/lib/misc');

var router = express.Router();
var routeTable = misc.getRouteTable();

router.get('/', function (req, res) {
    console.log(req.path);

    res.send('hi');
});

module.exports = router;
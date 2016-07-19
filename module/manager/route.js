var express = require('express');
var winston = require('winston');

var router = express.Router();

var routeTable = BLITITOR.route;

router.get('/', function (req, res) {
    console.log(req.path);

    res.send('hi');
});

module.exports = router;
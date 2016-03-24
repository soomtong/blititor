var express = require('express');
//var winston = require('winston');

var middleware = require('./middleware');

// load default modules
var site = require('../module/site');

var router = express.Router();

router.use(middleware.exposeParameter);

router.use(site.exposeMenu);
router.use(site.exposeRoute);
// router.use(site.exposeParameter);

module.exports = router;
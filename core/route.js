var express = require('express');
var middleware = require('./middleware');

var router = express.Router();

function index(req, res, next) {
    res.send(BLITITOR.config);
}

function databaseSetup(req, res, next) {
    res.send('setup DB, setup Admin Account');
}

router.get('/', middleware.databaseCheck, index);
router.get('/admin/setup', middleware.bypassDatabase, databaseSetup);

module.exports = router;
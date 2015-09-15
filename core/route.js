var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    var params = {
    };

    //req.session.clientRoute = null;
    /*
     if (req.isAuthenticated()) {
     res.redirect('/dashboard');
     } else {
     res.render('index', params);
     }
     */
    //res.render('landing', params);

    res.send(BLITITOR.config);
});

module.exports = router;
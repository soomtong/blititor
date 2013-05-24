exports.getIndex = function (req, res) {
    res.send('show index page then load json from server and bind to knockout');
};

exports.getHome = function (req, res) {
    res.send('generate json for home page : carousel bind')
};
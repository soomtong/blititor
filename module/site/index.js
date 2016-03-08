function index(req, res) {
    var params = {};

    res.render(BLITITOR.config.site.theme + '/page/index', params);
}

function pages(req, res) {
    var params = {};

    res.render(BLITITOR.config.site.theme + '/page' + req.path, params);
}

module.exports = {
    index: index,
    pages: pages
};
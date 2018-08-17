var Teamblog = require('../../module/teamblog/index');
var common = require('../../core/lib/common');

function indexPage(req, res) {
    var params = {
        title: "Home",
        recentPostCount: 4,
        recentPostList: []
    };

    // load recent articles
    Teamblog.recentPost(params, function (error, results) {
        if (!error) {
            results.map(function (item) {
                params.recentPostList.push({
                    title: item['title'],
                    preview: common.getHeaderTextFromMarkdown(item['content'], 200)
                });
            });
        }

        res.render(BLITITOR.site.theme + '/page/index', params);
    });
}

module.exports = {
    indexPage: indexPage
};
exports.listPost = function (req, res) {
    res.send('show list page for article list : ')
};

exports.viewPost = function (req, res) {
    res.send('show article page');
};

exports.postForm = function (req, res) {
    res.send('show post editor page for new and modify');
};

exports.makePost = function (req, res) {
    res.send('make post or update post');
};
var post = require('./model/post');

exports.listPost = function (req, res) {
    var params = {
        menu: [
            {
                name: "List",
                link: "/list",
                css: "active",
                key: "1"
            },
            {
                name: "View",
                link: "/view",
                css: "",
                key: "2"
            }
        ],
        login: req.session.login,
        list: [
            {
                title: "title 1",
                link: "/",
                desc: "description"
            },
            {
                title: "title 2",
                link: "/",
                desc: "description"
            },
            {
                title: "title 3",
                link: "/",
                desc: "description"
            },
            {
                title: "title 4",
                link: "/",
                desc: "description"
            },
            {
                title: "title 5",
                link: "/",
                desc: "description"
            }
        ]
    };

    res.render('list', params);
};
exports.viewPost = function (req, res) {
    var params = {
        menu: [
            {
                name: "List",
                link: "/list",
                css: "",
                key: "1"
            },
            {
                name: "View",
                link: "/view",
                css: "active",
                key: "2"
            }
        ],
        login: req.session.login,
        view: {
            title: "title 10",
            link: "/",
            desc: "description"
        }
    };

    res.render('view', params);
};

exports.postForm = function (req, res) {
    var params = {
        menu: [
            {
                name: "List",
                link: "/list",
                css: "",
                key: "1"
            },
            {
                name: "View",
                link: "/view",
                css: "",
                key: "2"
            }
        ],
        login: req.session.login,
        view: {
            title: "title 10",
            link: "/",
            desc: "description"
        }
    };

    res.render('form', params);
};

exports.makePost = function (req, res) {
    var post = req.body;
    post.files = req.files;
    post.author = req.session.login;

    console.log(post);

    // add post model
    post.setPost(post, function (error, result) {
        res.json(post);
    });
};
var async = require('async');
var post = require('./model/post');

exports.getIndex = function (req, res) {
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
        featured: [
            {
                title: "title",
                link: "/",
                desc: "simple blog for nodejs"
            },
            {
                title: "title 2",
                link: "/",
                desc: "simple blog for nodejs"
            }
        ],
        list: [
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

    res.render('index', params);
};

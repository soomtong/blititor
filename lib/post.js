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
                name: "menu1",
                link: "/1",
                css: "",
                key: "2"
            }
        ],
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

    if (req.xhr) {
        res.json(params);
    } else {
        res.render('list', params);
    }
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
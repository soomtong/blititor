var mongo = "";

exports.getIndex = function (req, res) {
    res.render('index');
};

exports.getHome = function (req, res) {
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
    res.json(params);
};
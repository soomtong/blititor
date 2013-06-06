var mongo = require('../utility').mongodb;
var postCollection = 'blititor';

exports.getMenu = function (callback) {
    var docs = mongo.collection(postCollection);

    docs.find({ "menu_title": {$ne: ""}},{"menu_title": true, "bind_key": true})
        .sort({ _id: 1 })
        .toArray(callback);
};

exports.getPost = function (id, callback) {
    var docs = mongo.collection(postCollection);

    if (typeof id == 'string' && id.length == 24) {
        id = mongo.ObjectID.createFromHexString(id);
    }

    docs.findOne({ '_id': id }, callback);
};

exports.setPost = function (document, callback) {
    var docs = mongo.collection(postCollection);

    if (document._id) {
        var id = mongo.ObjectID.createFromHexString(document._id);
        delete document._id;

        document.updatedAt = new Date();
        docs.update({ _id: id }, { $set: document }, { strict: true }, callback);
    } else {
        document.createdAt = new Date();
        docs.insert(document, { strict: true }, callback);
    }
};

exports.getPostListCount = function (args, callback) {
    var docs = mongo.collection(postCollection);

    var condition = {};

    if (args.author) condition.author = args.author;
    if (args.title) condition.title = args.title;

    docs.find(condition)
        .count(callback);
};

exports.getPostListCountAll = function (callback) {
    this.getPostListCount({}, callback);
};

exports.getPostList = function (args, callback) {
    var docs = mongo.collection(postCollection);

    var condition = {};

    if (args.home) condition.home = args.home;
    if (args.author) condition.author = args.author;
    if (args.title) condition.title = args.title;

    docs.find(condition)
        .sort({ _id: -1 })
        .skip(Number(args.pageSize) * ( args.page - 1 ))
        .limit(Number(args.pageSize))
        .toArray(callback);
};
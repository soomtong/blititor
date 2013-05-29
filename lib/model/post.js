var mongo = require('../utility').mongodb;
var postCollection = 'blititor';

exports.getMenu = function (callback) {
    var docs = mongo.collection(postCollection);

    docs.find({ "menu_title": {$ne: ""}},{"menu_title": true, "bind_key": true})
        .sort({ _id: 1 })
        .toArray(function (error, array) {
            callback(error, array);
        });
};

exports.getPost = function (id, callback) {
    var docs = mongo.collection(postCollection);

    if (typeof id == 'string' && id.length == 24) {
        id = mongo.ObjectID.createFromHexString(id);
    }

    docs.findOne({ '_id': id }, function (error, document) {
        callback(error, document);
    });
};

exports.setPost = function (document, callback) {
    var docs = mongo.collection(postCollection);

    if (document._id) {
        var id = mongo.ObjectID.createFromHexString(document._id);
        delete document._id;

        document.updatedAt = new Date();
        docs.update({ _id: id }, { $set: document }, { strict: true }, function (error, result) {
            callback(error, result);
        });
    } else {
        document.createdAt = new Date();
        docs.insert(document, { strict: true }, function (error, result) {
            callback(error, result[0]);
        });
    }
};

exports.getPostListCount = function (args, callback) {
    var docs = mongo.collection(postCollection);

    var condition = {};

    if (args.author) condition.author = args.author;
    if (args.title) condition.title = args.title;

    docs.find(condition)
        .count(function (error, count) {
        callback(error, count);
    });
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
        .toArray(function (error, array) {
            callback(error, array);
        });
};
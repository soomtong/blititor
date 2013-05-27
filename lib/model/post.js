var mongo = require('../utility').mongodb;
var postCollection = 'blititor';

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
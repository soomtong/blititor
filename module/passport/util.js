// serialize and deserialize
function serializeUser(user, done) {
    console.log('serializeUser: ' + user._id);
    done(null, user._id);
}

function deserializeUser(id, done) {
    User.findById(id, function(err, user){
        console.log(user);
        if(!err) done(null, user);
        else done(err, null);
    });
}

module.exports = {
    serializer: serializeUser,
    deserializer: deserializeUser
};
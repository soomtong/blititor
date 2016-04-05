// serialize and deserialize
function serializeUser(user, done) {
    console.log('serialize account' + user);
    done(null, user.id);
}

function deserializeUser(id, done) {
    /*User.findById(id, function(err, user){
     console.log(user);
     if(!err) done(null, user);
     else done(err, null);
     });*/
    console.log('deserialize by', id);
    var user = {username: 'passport', password: '1234'};
    done(null, user);
}

module.exports = {
    serializer: serializeUser,
    deserializer: deserializeUser
};
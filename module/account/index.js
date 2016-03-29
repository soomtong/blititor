var passport = require('./passport');

function Strategy(username, password, done) {
    console.log(arguments);
    /*User.findOne({ username: username }, function (err, user) {
     if (err) { return done(err); }
     if (!user) {
     return done(null, false, { message: 'Incorrect username.' });
     }
     if (!user.validPassword(password)) {
     return done(null, false, { message: 'Incorrect password.' });
     }
     });*/
    var user = {username: 'passport', password: '1234'};

    return done(null, user);
}

module.exports = {
    localStrategy: Strategy,
    passport: passport
};

function database(req, res, next) {
    if (!BLITITOR.config.database) {
        res.redirect('/admin/setup');
    } else {
        next();
    }
}

function pass(req, res, next) {
    if (BLITITOR.config.database) {
        res.redirect('/');
    } else {
        next();
    }
}

module.exports = {
    databaseCheck: database,
    bypassDatabase: pass
};
function createDatabase(connection, dbName, callback) {
    console.log(' = Make database...');

    // make database by given name
    var sql = 'CREATE DATABASE IF NOT EXISTS ?? DEFAULT CHARACTER SET = ??';
    connection.query(sql, [dbName, 'utf8'], function (err, results) {

        // if has argument then execute callback
        if (callback && typeof callback === 'function') callback(err, results);
    });
}

module.exports = {
    createDatabase: createDatabase,
};
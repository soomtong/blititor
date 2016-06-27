var colors = require('colors');

function createDatabase(connection, dbName, callback) {
    connection.connect(function(err) {
        console.log(' = Verify connection parameters...'.blue);

        if (err) {
            console.log(' = Verify connection parameters... Failed'.red);

            connection.destroy();

            console.error('error connecting: ' + err.stack);
        } else {
            console.log(' = Make database tables...\n'.blue);

            // make database by given name
            var sql = 'CREATE DATABASE IF NOT EXISTS ?? DEFAULT CHARACTER SET = ??';
            connection.query(sql, [dbName, 'utf8'], function (err, results) {
                connection.destroy();

                // if has argument then execute callback
                callback();
            });
        }
    });

}

module.exports = {
    createDatabase: createDatabase,
};
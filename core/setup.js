// setup blititor process for command line interface
/*
blititor> node core/setup

or

blititor> node core/setup all

is equals

blititor> node core/setup config
blititor> node core/setup init
blititor> node core/setup template
*/

var params = process.argv;

console.log(params[2]);

var prompt = require('prompt');
var async = require('neo-async');

switch (params) {
    case 'config':
        makeDatabaseConfigFile();
        break;
    case 'init':
        makeDatabaseTable();
        break;
    case 'templage':
        makeThemeConfigFile();
        makeThemeTemplage();
        break;
    case 'all':
    default:
        makeDatabaseConfigFile();
        makeDatabaseTable();
        makeThemeConfigFile();
        makeThemeTemplage();
}

function makeDatabaseConfigFile() {
    console.log('=== make database config file ===');

    prompt.start();

    var configScheme = {
        properties: {
            db_host: {
                description: 'Enter mysql(maria) host',
                type: 'string',
                pattern: /^\w+$/,
                message: 'Host name must be only letters',
                required: true
            },
            db_port: {
                description: 'Enter mysql(maria) port',
                default: '3306',
                type: 'integer',
                pattern: /^[0-9]+$/,
                message: 'Port number must be only number',
                required: false
            },
            db_name: {
                description: 'Enter mysql(maria) database name',
                default: 'db_blititor',
                type: 'string',
                pattern: /^\w+$/,
                message: 'database name must be letters',
                required: false
            },
            db_user_id: {
                description: 'Enter mysql(maria) user name',
                type: 'string',
                pattern: /^\w+$/,
                message: 'Host name must be only letters',
                required: true
            },
            db_user_password: {
                description: 'Enter your password',
                type: 'string',
                message: 'Password must be letters',
                hidden: true,
                replace: '*',
                required: true
            }
        }
    };

    prompt.get(configScheme, function (err, result) {
        // 
        // Log the results. 
        // 
        console.log('Command-line input received:');
        console.log(result);
    });


}

function makeDatabaseTable() {

}

function makeThemeConfigFile() {

}

function makeThemeTemplage() {

}
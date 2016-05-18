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
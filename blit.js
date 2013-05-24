#! /usr/bin/env node
var path = require('path');
var program = require('commander');
var forever = require('forever');

program.command('ready')
    .description('standby database with sample data')
    .action(function () {
        console.log('blititor set up environments');
    });

program.command('start')
    .description('start blititor service')
    .action(function () {
        var script = path.join(__dirname, 'app.js');
        forever.startDaemon (script, {});

        console.log("blititor server is start...");
    });

program.command('stop')
    .description('stop blititor service')
    .action(function () {
        forever.stopAll();

        console.log("blititor server is stopped...");
    });

program.version('============================================================'
        + '\nblititor V0.1 - humble web board for nodejs using summernote')
    .parse(process.argv);

console.log('blititor - humble web board for nodejs using summernote');
console.log('\n    Help: blit.js -h');
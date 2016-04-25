// referenced https://github.com/TryGhost/Ghost/core/server/utils/startup-check.js
var packages = require('../../package.json');

function moduleInstalled(B) {
    console.info('=== check module dependency ...', Object.keys(packages['dependencies']).length, 'packages');

    var mode = B.env;

    if (mode !== 'production' && mode !== 'development') return;

    var errors = [];

    Object.keys(packages['dependencies']).forEach(function (p) {
        try {
            require.resolve(p);
        } catch (e) {
            errors.push(e.message);
        }
    });

    if (!errors.length) return;

    errors = errors.join('\n  ');

    console.error('\x1B[31mERROR: Blititor is unable to start due to missing dependencies:\033[0m\n  ' + errors);
    console.error('\x1B[32m\nPlease run `npm install --production` and try starting Blititor again.');

    process.exit(0);
}

function nodeVersion() {
    console.info('=== check node engine version ...', process['versions'].node);
    try {
        var semver = require('semver');
        if (!semver.satisfies(process['versions'].node, packages.engines.node) &&
            !semver.satisfies(process['versions'].node, packages.engines['iojs'])) {
            console.error('\x1B[31mERROR: Unsupported version of Node');
            console.error('\x1B[31mBlititor needs Node version ' + packages.engines.node +
                ' you are using version ' + process['versions'].node + '\033[0m\n');
            console.error('\x1B[32mPlease go to http://nodejs.org to get a supported version\033[0m');

            process.exit(0);
        }
    } catch (e) {
        if (e) {
            console.error('\x1B[31mERROR: Unsupported version of Node');
        }
    }
}

function checkAll(B) {
    // bind assigned port and real version
    var port = Math.abs(parseInt(process.argv[2]));
    if (port) B.config.site.port = port;

    B.config.revision = packages['version'] || B.config.revision;

    // check module installed npm and bower
    moduleInstalled(B);

    // check node version
    nodeVersion(B);

    // check database server running, no necessary
    //serverRunning();
}

module.exports = checkAll;
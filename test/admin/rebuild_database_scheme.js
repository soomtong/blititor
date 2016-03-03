// use this for make database scheme in development stage

global.BLITITOR = {
    config: {
    }
};

var database = require('../../core/admin/database');

BLITITOR.config.database = require('../../database');

database.makeDefaultScheme({reset: true});


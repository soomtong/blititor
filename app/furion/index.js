// load default modules for exports
var menu = require('./menu');
var route = require('./route');

module.exports = {
    route: route,
    exposeMenu: menu.expose
};
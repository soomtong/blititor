var selectedTheme = BLITITOR.config.site.theme;

var themePackage = require('../' + selectedTheme);
    
module.exports = {
    exposeMenu: themePackage.menu,
    exposeRoute: themePackage.router,
    // exposeParameter: themePackage.menu,
};
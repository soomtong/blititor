var bindKey = function (menuData) {
    var idx, keyBind;

    // bind home key
    jwerty.key('`', function () {
        window.location.href = '/';
    });

    // bind menu key
    for (idx in menuData) {
        if (menuData.hasOwnProperty(idx)) {
            keyBind = menuData[idx];
            (function (menu) {
                jwerty.key(menu.key, function () {
                    window.location.href = menu.link;
                });
            })(keyBind);
        }
    }
};

$(document).ajaxStart(function () {
    $('#loading').fadeIn();
}).ajaxStop(function () {
    $('#loading').fadeOut();
});
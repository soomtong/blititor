$(document).ajaxStart(function () {
    $('#loading').spin().show();
}).ajaxStop(function () {
    $('#loading').hide().spin(false);
});
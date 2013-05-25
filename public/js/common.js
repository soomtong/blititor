$(document).ajaxStart(function () {
    $('#loading').spin();
}).ajaxStop(function () {
    $('#loading').spin(false);
});
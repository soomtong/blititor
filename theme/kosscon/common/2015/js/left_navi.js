jQuery(window).load(function(e) {
if(!jQuery.browser.mobile){
/*top notice*/
function setCookie( name, value, expiredays ) {
var todayDate = new Date();
todayDate.setDate( todayDate.getDate() + expiredays );
document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + todayDate.toGMTString() + ";"
}
jQuery('.1234').click(function(e) {
if(jQuery('input:checkbox[id=close2]').is(':checked')){
setCookie( "kofacNotice", "done" , 1 );
}
jQuery('#test').fadeIn(300);
return false;
});
}
});

jQuery(window).load(function(e) {
if(!jQuery.browser.mobile){
/*top notice*/
function setCookie( name, value, expiredays ) {
var todayDate = new Date();
todayDate.setDate( todayDate.getDate() + expiredays );
document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + todayDate.toGMTString() + ";"
}
jQuery('.closes').click(function(e) {
if(jQuery('input:checkbox[id=close2]').is(':checked')){
setCookie( "kofacNotice", "done" , 1 );
}
jQuery('#test').fadeOut(300);
return false;
});
}
});
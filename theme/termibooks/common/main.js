$(document).ready(function () {
    $(window).on('resize', resizeHeaderOnScroll);
    $(window).scroll(resizeHeaderOnScroll);
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function () {
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });

    function resizeHeaderOnScroll() {
        const top = window.pageYOffset || document.documentElement.scrollTop;
        const navbar = $(".app-header .navbar");
        top > 100 ? navbar.addClass("is-small") : navbar.removeClass("is-small");
    }
});
/* init g-a */
(function ga() {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'UA-122849991-1');})();

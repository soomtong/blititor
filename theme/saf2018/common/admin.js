$(function () {
    const $window = $(window);
    const $navbarBurger = $('.navbar-burger');

    //reveal elements on scroll so animations trigger the right way
    const win_height_padded = $window.height() * 1.1;
    $window.on('scroll', revealOnScroll);

    function revealOnScroll() {
        const scrolled = $window.scrollTop();
        $(".revealOnScroll:not(.animated)").each(function () {
            const $this = $(this),
                offsetTop = $this.offset().top;

            if (scrolled + win_height_padded > offsetTop) {
                if ($this.data('timeout')) {
                    window.setTimeout(function () {
                        $this.addClass('animated ' + $this.data('animation'));
                    }, parseInt($this.data('timeout'), 10));
                } else {
                    $this.addClass('animated ' + $this.data('animation'));
                }
            }
        });
    }

    //Preloader
    $window.on('load', function () { // makes sure the whole site is loaded
        console.log('document loaded');
    });

    //Mobile menu toggle
    if ($navbarBurger.length) {
        $navbarBurger.on("click", function () {

            const menu_id = $(this).attr('data-target');
            $(this).toggleClass('is-active');
            $("#" + menu_id).toggleClass('is-active');
            $('.navbar.is-light').toggleClass('is-dark-mobile')
        });
    }

    //Animate left hamburger icon and open sidebar
    $('.menu-icon-trigger').click(function (e) {
        e.preventDefault();
        $('.menu-icon-wrapper').toggleClass('open');
        $('.sidebar').toggleClass('is-active');
    });

    // Back to Top button behaviour
    const pxShow = 600;
    const scrollSpeed = 500;
    $window.on('scroll', function () {
        if ($window.scrollTop() >= pxShow) {
            $("#back_to_top").addClass('visible');
        } else {
            $("#back_to_top").removeClass('visible');
        }
    });
    $('#back_to_top a').on('click', function () {
        $('html, body').animate({
            scrollTop: 0
        }, scrollSpeed);
        return false;
    });

    // Select all links with hashes
    // Remove links that don't actually link to anything
    $('a[href*="#"]')
        .not('[href="#"]')
        .not('[href="#0"]')
        .on('click', function (event) {
            // On-page links
            if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '')
                &&
                location.hostname === this.hostname) {
                // Figure out element to scroll to
                let target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                // Does a scroll target exist?
                if (target.length) {
                    // Only prevent default if animation is actually gonna happen
                    event.preventDefault();
                    $('html, body').animate({
                        scrollTop: target.offset().top
                    }, 550, function () {
                        // Callback after animation
                        // Must change focus!
                        const $target = $(target);
                        $target.focus();
                        if ($target.is(":focus")) { // Checking if the target was focused
                            return false;
                        } else {
                            $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                            $target.focus(); // Set focus again
                        }
                    });
                }
            }
        });
});

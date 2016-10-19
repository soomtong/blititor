// Closes the sidebar menu
$("#menu-close").click(function(e) {
    e.preventDefault();
    $("#sidebar-wrapper").toggleClass("active");
});
// Opens the sidebar menu
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#sidebar-wrapper").toggleClass("active");
});
// Scrolls to the selected menu item on the page
$(function() {
    // Animate Typo
    $('#typing_text').typist({
        speed: 8,
        text: 'OPEN SOURCE. REAL ACTION.'
    });

    function changeImages() {
        var prevIndex = index;
        index = (index + 1) % img_array.length;

        $backgroundImage.removeClass(img_array[prevIndex]);
        $backgroundImage.addClass(img_array[index]);

        setTimeout(changeImages, timer);
    }

    var img_array = ['bg-image-1', 'bg-image-2', 'bg-image-3', 'bg-image-4'];
    var timer = 8000;
    var index = 0;
    var $backgroundImage = $('.bg-image');

    // Background Images
    if ($backgroundImage.length) {
        setTimeout(changeImages, timer);
    }

    // Bind Ajax
    $('.secret').off('click').on('click', getPhoneSecret);

    // Enable map zooming with mouse scroll when the user clicks the map
    // $('#location').off('click', '.map').on('click', '.map', onMapClickHandler);
    $('.map').off('click').on('click', onMapClickHandler);

    $('a[href*=\\#]:not([href=\\#],[data-toggle],[data-target],[data-slide])').click(function() {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });

    //#to-top button appears after scrolling
    var fixed = false;
    $(document).scroll(function() {
        if ($(this).scrollTop() > 250) {
            if (!fixed) {
                fixed = true;
                // $('#to-top').css({position:'fixed', display:'block'});
                $('#to-top').show("slow", function() {
                    $('#to-top').css({
                        position: 'fixed',
                        display: 'block'
                    });
                });
            }
        } else {
            if (fixed) {
                fixed = false;
                $('#to-top').hide("slow", function() {
                    $('#to-top').css({
                        display: 'none'
                    });
                });
            }
        }
    });

});
// Disable Google Maps scrolling
// See http://stackoverflow.com/a/25904582/1607849
// Disable scroll zooming and bind back the click event
var onMapMouseleaveHandler = function (event) {
    var that = $(this);
    that.off('click').on('click', onMapClickHandler);
    that.off('mouseleave', onMapMouseleaveHandler);
    that.find('iframe').css("pointer-events", "none");
};
var onMapClickHandler = function (event) {
    // This will prevent event triggering more then once
    if(event.handled !== true) {
        event.handled = true;
    }

    var that = $(this);
    // Disable the click handler until the user leaves the map area
    that.off('click', onMapClickHandler);
    // Enable scrolling zoom
    that.find('iframe').css("pointer-events", "auto");
    // Handle the mouse leave event
    that.on('mouseleave', onMapMouseleaveHandler);
};
var getPhoneSecret = function (event) {
    // This will prevent event triggering more then once
    if(event.handled !== true) {
        event.handled = true;
    }

    var that = $(this);
    var $phone = $('#phone');
    var $secret = $('#phone_secret');
    var $message = $('#phone_message');
    var secretToken = $('input[name="_csrf"]').eq(0).val();
    var actionURL = $('input[name="phone_secret"]').eq(0).val();

    if (!$phone.val()) {
        $phone.focus();
        $message.fadeIn(function () {
            setTimeout(function () {
                $message.fadeOut(1);
            }, 1500);
        });
        return false;
    }

    $.post(actionURL, {phone: $phone.val(), _csrf: secretToken}, function (result) {
        console.log(result);

        that.hide();

        $secret.show();
    });

    // return false;
};

var sendReservation = function (event) {
    var that = $(this);
    var $name = $('#name');
    var $email = $('#email');
    var $phone = $('#phone');
    var $phone_secret = $('#phone_secret');
    var $info = $('#info');

    if (!$name.val()) {
        $name.focus();
        $name.siblings('.name_message').fadeIn(function () {
            var that = this;
            setTimeout(function () {
                $(that).fadeOut(1);
            }, 1500);
        });

        return false;
    }

    if (!$email.val()) {
        $email.focus();
        $email.siblings('.email_message').fadeIn(function () {
            var that = this;
            setTimeout(function () {
                $(that).fadeOut(1);
            }, 1500);
        });

        return false;
    }

    if (!$phone.val()) {
        $phone.focus();
        $phone.siblings('.phone_message').fadeIn(function () {
            var that = this;
            setTimeout(function () {
                $(that).fadeOut(1);
            }, 1500);
        });

        return false;
    }

    if (!$phone_secret.val()) {
        $phone_secret.siblings('.phone_secret_message').fadeIn(function () {
            var that = this;
            setTimeout(function () {
                $(that).fadeOut(1);
            }, 1500);
        });

        return false;
    }

    if (!$info.val()) {
        $info.focus();
        $info.siblings('.info_message').fadeIn(function () {
            var that = this;
            setTimeout(function () {
                $(that).fadeOut(1);
            }, 1500);
        });

        return false;
    }
};
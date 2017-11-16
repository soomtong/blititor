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
        text: 'KOREA OPEN SOURCE SOFTWARE CONFERENCE'
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
        // setTimeout(changeImages, timer);
    }

    // Bind Ajax
    $('.secret').off('click').on('click', getPhoneSecret);

    // Bind Form
    $('#register_form').on('click', 'button.submit', sendReservation);

    // Reset Radio
    $('#skip_tutorial').on('click', resetTutorials);

    // Collapse
    var $sectionCollapse = $('#update_section_data');

    if (!$('#toggle_collapse').length) {
        $sectionCollapse.collapse();
    } else {
        $sectionCollapse.on('show.bs.collapse', function () {
            $('#form_submit').hide();
            $('#form_update_submit').text('사전 등록 내용 갱신');
        });
        $sectionCollapse.on('hide.bs.collapse', function () {
            $('#form_submit').show();
            $('#form_update_submit').text('사전 등록 신청');
        });
    }

    // Load Gallery
    if ($('#gallery').find('.gallery-wrap').length) {
        var imageFolder = '/upload/gallery/image/';

        $('.gallery-wrap').map(function (idx, el) {
            var cateID = $(el).data('id');

            if (cateID) {
                $.get('/gallery/image/' + Number(cateID), {}, function (response, status, xhr) {
                    response.map(function (item) {
                        // console.log(item);
                        $('<img class="img-thumbnail center-block" />')
                            .attr('src', imageFolder + item['thumbnail'])
                            .attr('title', item['image'])
                            .appendTo('#gallery_' + cateID + ' .image-list');
                        $('<br>')
                            .appendTo('#gallery_' + cateID + ' .image-list');
                    });
                });
            }
        });
    }

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
        if (result.status == 'success') {
            that.hide();

            $secret.show();
        } else {
            alert('휴대폰 인증 서비스가 실패되었습니다. 잠시 후 다시 이용해 주세요.');
        }
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
    var $privacy_order = $('#privacy_order');

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
        $phone.focus();
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

    if (!$privacy_order.is(':checked')) {
        $privacy_order.focus();
        $privacy_order.siblings('.privacy_message').fadeIn(function () {
            var that = this;
            setTimeout(function () {
                $(that).fadeOut(1);
            }, 1500);
        });

        return false;
    }
};

var resetTutorials = function (event) {
    $('input[name="register_apply_tutorial1"]').removeAttr('checked');
    $('input[name="register_apply_tutorial2"]').removeAttr('checked');
    $('input[name="register_apply_tutorial3"]').removeAttr('checked');
    $('input[name="register_apply_tutorial1"]').eq(0).prop('checked', true);
    $('input[name="register_apply_tutorial2"]').eq(0).prop('checked', true);
    $('input[name="register_apply_tutorial3"]').eq(0).prop('checked', true);
};
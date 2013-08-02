var postForm = function () {
    var result = false;
    var form = $('#postForm');

    if (form.find('input[name="title"]').val()) {
        if (form.find('input.use-menu').prop('checked')) {
            if (form.find('input[name="menu_title"]').val()) {
                result = true;
            }
        } else {
            result = true;
        }
    }

    return result;
};
var checkButton = function () {
    var form = $('#postForm');

    if (form.find('input[name="title"]').val()) {
        form.find('button[type="submit"]').removeClass('disabled');
    } else {
        if (!form.find('button[type="submit"]').hasClass('disabled')) {
            form.find('button[type="submit"]').addClass('disabled');
        }
    }
    if (form.find('input.use-menu').prop('checked')) {
        if (form.find('input[name="menu_title"]').val()) {
            form.find('button[type="submit"]').removeClass('disabled');
        } else {
            if (!form.find('button[type="submit"]').hasClass('disabled')) {
                form.find('button[type="submit"]').addClass('disabled');
            }
        }
    }
};

$(document).ready(function () {
    $('#summernote').summernote({
        height: 361,
        focus: true
    });

    $('#cancel').click(function () {
        history.back();
    });

    // activate top menu
    var menu = 'post';
    $('#top_menu li[data-id="' + menu + '"]').addClass('active');

    var form = $('#postForm');

    // bind event
    form.on('keyup', 'input[name="title"],input[name="menu_title"]', function () {
        checkButton();
    });
    form.on('click', '.controls .checkbox', function () {
        checkButton();
        if ($(this).find('input.use-menu').prop('checked')) {
            if (form.find('div.use-menu').hasClass('hide')) {
                form.find('div.use-menu').removeClass('hide');
            }
        } else {
            if (!form.find('div.use-menu').hasClass('hide')) {
                form.find('div.use-menu').addClass('hide');
            }
        }
        if ($(this).find('input.use-bg').prop('checked')) {
            if (form.find('div.use-bg').hasClass('hide')) {
                form.find('div.use-bg').removeClass('hide');
            }
        } else {
            form.find('div.use-bg').addClass('hide');
        }
    });

    // bind 'myForm' and provide a simple callback function
    form.submit(function() {
        $('textarea[name="content"]').val($('#summernote').code()[0]);
        $(this).ajaxSubmit({
            beforeSubmit: postForm,
            success: function (response, status) {
                console.log(response);
                if (status && response.id) {
                    location.href = '/view/' + response.id;
                } else {
                    // show message
                    form.find('div.alert-danger').removeClass('hide');
                    setTimeout(function () {
                        form.find('div.alert-danger').addClass('hide');
                    }, 5000);
                }
            }
        });

        // prevent default submit
        return false;
    });
});

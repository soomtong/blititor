/* global $, window */
'use strict';
$(function () {
    var done = function (e, data) {
        var file = data.result;

        var thumbnail = '/upload/gallery/thumb/';
        var path = file.path.split('/');
        var name = path[path.length - 1];
        var categoryID = $('#add_image').parent().parent().parent().data('id');

        console.log(file);

        if (file.errors && file.errors.length > 0) {
            // $('#files').empty();
            // $('<p/>').text('잘못된 파일이 전송되었습니다.').appendTo('#files');
        } else {
            $('#files').empty();

            $('<img class="thumbnail" />').attr('src', thumbnail + name).appendTo('#files');
            $('<input name="thumb" type="hidden">').attr('value', name).appendTo('#add_image');
            $('<input name="image" type="hidden">').attr('value', file.originalname).appendTo('#add_image');
            $('<input name="path" type="hidden">').attr('value', file.path).appendTo('#add_image');
            $('<input name="category" type="hidden">').attr('value', categoryID).appendTo('#add_image');

            $('#add_image button[type=submit]').prop('disabled', false).text('전송하기').addClass('button-secondary').removeClass('button-warning');

            $('#gallery_image_file').prop('disabled', true).parent().addClass('disabled');
        }
    };

    var progress = function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#progress .progress-bar').css('width', progress + '%');
    };

    var url = '/gallery/upload/image';

    var token = $('input[name="_csrf"]').val();

    // $('#progress .progress-bar').css('width', '50%');

    $('#gallery_image_file').fileupload({
        url: url,
        headers: { 'X-CSRF-Token': token },
        dataType: 'json',
        formData: { },
        done: done,
        progressall: progress
    });
});

/* global $, window */
'use strict';
var thumbnail = '/upload/gallery/thumb/';
var categoryID = 1;

$(function () {
    var done = function (e, data) {
        var file = data.result;

        var path = file.path.split('/');
        var name = path[path.length - 1];
        // categoryID = $(e.target).parent().parent().parent().parent().parent().data('id');

        console.log(categoryID, file);

        if (file.errors && file.errors.length > 0) {
            // $('#files').empty();
            // $('<p/>').text('잘못된 파일이 전송되었습니다.').appendTo('#files');
        } else {
            // $('#files').empty();

            $('<img class="thumbnail" />').attr('src', thumbnail + name).appendTo('#holder_' + categoryID + ' .img-holder .files');
            $('<input name="thumb" type="hidden">').attr('value', name).appendTo('#add_image');
            $('<input name="image" type="hidden">').attr('value', file.originalname).appendTo('#add_image');
            $('<input name="path" type="hidden">').attr('value', file.path).appendTo('#add_image');
            $('<input name="category" type="hidden">').attr('value', categoryID).appendTo('#add_image');

            $('#add_image button[type=submit]').prop('disabled', false).text('전송하기').addClass('button-error').removeClass('button-warning');

            $('#gallery_image_file').prop('disabled', true).parent().addClass('disabled');

/*
            $.get('/gallery/image/' + Number(categoryID), {}, function (response, status, xhr) {
                response.map(function (item) {
                    $('<img class="thumbnail" />')
                        .attr('src', thumbnail + item['thumbnail'])
                        .attr('title', item['image'])
                        .appendTo('#holder_' + categoryID + ' .img-holder .files');
                });
            });
*/
        }
    };

    var progress = function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#progress .progress-bar').css('width', progress + '%');
    };

    var url = '/gallery/upload/image';

    var token = $('input[name="_csrf"]').val();

    $('#gallery_image_file').fileupload({
        url: url,
        headers: { 'X-CSRF-Token': token },
        dataType: 'json',
        formData: { },
        done: done,
        progressall: progress
    });

    $('.gallery-wrap').map(function (idx, el) {
        var cate_id = $(el).data('id');
        if (cate_id) {
            $.get('/gallery/image/' + Number($(el).data('id')), {}, function (response, status, xhr) {
                response.map(function (item) {
                    // console.log(item);
                    $('<img class="thumbnail" />')
                        .attr('src', thumbnail + item['thumbnail'])
                        .attr('title', item['image'])
                        .appendTo('#holder_' + cate_id + ' .img-holder .files');
                });
                $('#cate_' + cate_id + ' .counter').text(response.length);
            });
        }
    });

    $('.gallery').on('click', 'tr.toggle-category', function (e) {
        categoryID = $(this).data('id');

        $('tr.toggle-category').removeClass('selected-category');
        $(this).addClass('selected-category');

        $('#add_image').show();
    });
});

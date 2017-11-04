/* global $, window */
'use strict';

$(function () {
    var $uploadEl = $('#gallery_image_file');
    var $galleryWrapEl = $('.gallery-wrap');

    var thumbnailFolder = '/upload/gallery/thumb/';
    var imageUploadURL = '/gallery/upload/image';
    var imageListURL = '/gallery/image/';

    var selectedCategoryID = 1;
    var secretToken = $('input[name="_csrf"]').eq(0).val();

    $galleryWrapEl.map(function (idx, el) {
        var cate_id = $(el).data('id');
        var sortTable = [];

        if (cate_id) {
            $.get(imageListURL + Number($(el).data('id')), {}, function (response) {
                response.map(function (item) {
                    $('<img class="thumbnail" />')
                        .attr('src', thumbnailFolder + item['thumbnail'])
                        .attr('data-sort', item['id'])
                        .attr('title', item['image'])
                        .appendTo('#holder_' + cate_id + ' .img-holder .files');
                });

                $('#cate_' + cate_id + ' .counter').text(response.length);

                // bind drag and drop for re-order
                var $dragEl = $('#holder_' + cate_id + ' .img-holder .files');

                dragula([$dragEl[0]])
                    .on('drop', function () {
                        // don't worry, this map function is going to sync mode
                        $dragEl.find('img.thumbnail').map(function (idx, el) {
                            sortTable.push($(el).data('sort'));
                        });

                        var sortingData = {
                            category: cate_id,
                            sort: sortTable,
                            '_csrf': secretToken
                        };

                        $.post('/manage/gallery/image/sort', sortingData, function (data) {
                            sortTable = [];
                        });
                    });
            });
        }
    });

    $('.gallery').on('click', 'tr.toggle-category', function (e) {
        resetProgressBar();
        selectedCategoryID = $(this).data('id');

        $('tr.toggle-category').removeClass('selected-category');
        $(this).addClass('selected-category');

        $uploadEl.fileupload({
            url: imageUploadURL,
            headers: { 'X-CSRF-Token': secretToken },
            dataType: 'json',
            formData: { category: selectedCategoryID },
            done: imageUploaded($uploadEl, thumbnailFolder, secretToken),
            progressall: imageUploadProgress('#progress .progress-bar'),
            send: function (e, data) {
                resetProgressBar();

                return true;
            }
        });

        $('#add_image').show();
    });

    function resetProgressBar() {
        $('#progress').empty();
        $('#progress').append('<div class="progress-bar progress-bar-success">');
    }

    function imageUploadProgress(element) {
        return function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $(element).css('width', progress + '%');
        };
    }

    function imageUploaded($uploadEl, thumbnailFolder, secretToken) {
        return function (e, data) {
            var categoryID = selectedCategoryID;
            var file = data.result;

            if (!file || (file.errors && file.errors.length > 0)) {
                // $('#files').empty();
                // $('<p/>').text('잘못된 파일이 전송되었습니다.').appendTo('#files');
            } else {
                var path = file.path.split('/');
                var name = path[path.length - 1];

                $('#holder_' + categoryID + ' .img-holder .files')
                    .append($('<img class="thumbnail" />').attr('src', thumbnailFolder + name).addClass('uploaded'))
                    .on('click', 'img.uploaded', function (e) {
                        // delete temp file
                        var fileData = {
                            file: file,
                            '_csrf': secretToken
                        };

                        var $uploaded = $(this);

                        $.post('/manage/gallery/image/remove', fileData, function (data) {
                            console.log(data);
                            console.log($uploaded.remove());
                        });
                    });

                $('#add_image')
                    .append($('<input name="thumb" type="hidden">').attr('value', name))
                    .append($('<input name="image" type="hidden">').attr('value', file.originalname))
                    .append($('<input name="path" type="hidden">').attr('value', file.path))
                    .append($('<input name="category" type="hidden">').attr('value', categoryID))
                    .find('button[type=submit]').prop('disabled', false).text('전송하기')
                    .addClass('button-error').removeClass('button-warning');

                $uploadEl.prop('disabled', true).parent().prop('disabled', true);
            }
        };
    }
});

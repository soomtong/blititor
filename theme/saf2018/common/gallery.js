$(function () {
    const csrf = $('meta[name=csrf-token]').attr('content') || '';
    const $categoryControl = $('.gallery-write-control');
    const imageUploadedFolder = '/upload/gallery/image';

    if ($categoryControl) {
        $categoryControl.on('click', '.control button.make-category', function (e) {
            e.preventDefault();

            $categoryControl.find('form.is-category-form').toggle()
        });

        $categoryControl.find('form.is-category-form').on('submit', function (e) {
            let title = $categoryControl.find('input[name=category]').val();

            if (!title) {
                e.preventDefault();

                $categoryControl.find('input[name=category]').trigger('focus');
            }
        });

        const flow = new Flow({
            target: '/gallery/image',
            headers: { 'X-CSRF-Token': csrf },
            testChunks: false
        });

        if (!flow.support) location.href = '/';

        flow.assignBrowse($('span.image-append'), false, false, { accept: 'image/*' });

        flow.on('fileAdded', function (file, event) {
            const galleryID = event.path[4].id || '0';

            file.galleryCategory = galleryID;
            flow.opts.query.category = galleryID;
            flow.opts.query.title = '';
        });

        flow.on('filesSubmitted', function (results) {
            flow.upload();
        });

        flow.on('fileSuccess', function (file, message) {
            try {
                const uploadedFileInfo = JSON.parse(message);

                const html = `<div class="message-body">
                    <figure class="image">
                        <img src="${imageUploadedFolder}/${uploadedFileInfo.imageFile}">
                        <p class="image-desc"></p>
                    </figure>
                </div>`;

                $('#' + file.galleryCategory).append(html)
            } catch (e) {
                console.log('JSON parse error occurs');
                console.error(e);
            }
        });

        flow.on('fileError', function (results, message) {
            console.error(results, message);
        });
    }

    const $galleryControl = $('.gallery-list-control');
    const $deleteControl = $galleryControl.find('a.gallery-delete');

    if ($deleteControl) {
        $deleteControl.on('click', function (e) {
            e.preventDefault();

            const galleryID = $(this).parents('article.message').attr('id');

            const url = $deleteControl.attr('href');
            const formData = {
                mode: 'delete',
                galleryID: galleryID,
                _csrf: csrf
            };

            $.post(url, formData, () => {
                window.location.href = url;
            })
        })
    }
});
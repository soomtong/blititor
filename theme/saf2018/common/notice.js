$(function () {
    const csrf = $('meta[name=csrf-token]').attr('content') || '';

    const $noticeControl = $('.notice-list-control');
    const $deleteControl = $noticeControl.find('a.notice-delete');

    if ($deleteControl) {
        $deleteControl.on('click', function (e) {
            e.preventDefault();

            const noticeID = $(this).parents('article.message').attr('id');

            const url = $deleteControl.attr('href');
            const formData = {
                mode: 'delete',
                noticeID: noticeID,
                _csrf: csrf
            };

            $.post(url, formData, () => {
                window.location.href = url;
            })
        })
    }
});
$(function () {
    const csrf = $('meta[name=csrf-token]').attr('content') || '';
    const $noticeList = $('#notice-list');
    const $noticeForm = $('#notice-form');

    if ($noticeList) {
        getFirstList();

        $noticeList.on('click', '.post-title a', function (e) {
            e.preventDefault();

            $noticeList.find('h3.card-heading i.fa').addClass('fa-pulse');
            $(this).parents('.media-content').find('.post-body').toggle();
            setTimeout(() => {
                $noticeList.find('h3.card-heading i.fa').removeClass('fa-pulse');
            }, 500);
        })
    }

    if ($noticeForm) {
        $noticeForm.on('submit', function (e) {
            e.preventDefault();

            if (!$noticeForm.find('input[name=title]').val()) {
                $noticeForm.find('input[name=title]').trigger('focus');
                return;
            }

            if (!$noticeForm.find('textarea[name=body]').val()) {
                $noticeForm.find('textarea[name=body]').trigger('focus');
                return;
            }

            const url = '/manage/notice';
            const formData = {
                mode: 'write',
                title: $noticeForm.find('input[name=title]').val(),
                body: $noticeForm.find('textarea[name=body]').val(),
                _csrf: csrf
            };

            $noticeForm.find('input[name=title]').val('');
            $noticeForm.find('textarea[name=body]').val('');

            $noticeList.find('h3.card-heading i.fa').addClass('fa-pulse');

            $.post(url, formData, () => {
                clearList(getFirstList);
            });
        });
    }

    function clearList(callback) {
        $noticeList.find('.recent-post').remove();

        callback();
    }

    function getFirstList() {
        const url = '/manage/notice';
        const query = {
            mode: 'list',
            page: 0,
            _csrf: csrf
        };

        $.post(url, query, (htmlData) => {
            $noticeList.find('h3.card-heading').after(htmlData);
            setTimeout(() => {
                $noticeList.find('h3.card-heading i.fa').removeClass('fa-pulse');
            }, 500);
        });
    }
});
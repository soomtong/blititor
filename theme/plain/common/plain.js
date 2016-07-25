Plain = {};

Plain.initDatePicker = function ($) {
    $.fn.datepicker.languages['ko-KR'] = {
        format: 'yyyy년 mm 월 dd일',
        days: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
        daysShort: ['일', '월', '화', '수', '목', '금', '토'],
        daysMin: ['일', '월', '화', '수', '목', '금', '토'],
        months: ['1 월', '2 월', '3 월', '4 월', '5 월', '6 월', '7 월', '8 월', '9 월', '10 월', '11 월', '12 월'],
        monthsShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        weekStart: 1,
        startView: 0,
        yearFirst: true,
        yearSuffix: '년'
    };
};

Plain.bindDatePicker = function () {
    var createdAt = $('.created-at');
    var updatedAt = $('.updated-at');
    createdAt.datepicker({
        date: new Date(createdAt.val()),
        language: 'ko-KR',
        yearFirst: true,
        inline: true,
        container: '#picker_created_at',
        format: 'yyyy-mm-dd'
    });
    updatedAt.datepicker({
        date: updatedAt.val() ? new Date(updatedAt.val()) : new Date(),
        language: 'ko-KR',
        container: '#picker_updated_at',
        inline: true,
        yearFirst: true,
        format: 'yyyy-mm-dd'
    });
};

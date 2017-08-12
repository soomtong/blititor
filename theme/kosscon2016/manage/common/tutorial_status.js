$(function () {
    var toggle = false;
    var $holder = $('.reservation-status');

    $holder.on('click', '.title a', function (e) {
        e.preventDefault();

        var $position = $(this).parent().parent();
        var id = $position.data('id');

        if (toggle) {
            $('#list_holder').remove();
            toggle = false;
        } else {
            $position.after('<tr><td colspan="4" id="list_holder">');

            $('#list_holder').load('/manage/reservation/tutorial/status?id=' + id);
            toggle = true;
        }

        return false;
    });
});
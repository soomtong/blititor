$(document).ready(function(){
    var $userList = $('#users');

    $('#public').submit(function(){
        var $m = $('#m');
        socket.emit('chat message', {msg : $m.val()});
        $m.val('');

        return false;
    });

    $('#private').submit(function(){
        socket.emit('chat message', {
                nickname : $('#nickname_val').val(),
                msg : $('#msg_val').val()
            }
        );
        $('#nickname_val').val('');
        $('#msg_val').val('');
        $('#private_chat_pop').bPopup().close();

        return false;
    });

    $(document).on('click', '#users li.user-id', function () {
        var $nickname = $(this).text();
        var socketId = $(this).data('socketId');

        if (socketId == '/#' + socket.id) {
            return alert('나에게 귓속말을 보낼 수 없습니다');
        }
        $('#nickname_display').text($nickname);
        $('#nickname_val').val($nickname);
        $('#private_chat_pop').bPopup();
    });


    var socket = io();

    socket.on('join', function (data) {
        updateUserList($userList, data)
    });

    socket.on('leave', function (data) {
        updateUserList($userList, data)
    });

    socket.on('chat message', function (data) {
        if (data.chat_type == "public") {
            var message = data.nickname + ' : ' + data.msg;
        } else if (data.chat_type == "private") {
            var message = data.nickname + '으로부터의 귓속말 : ' + data.msg;
        }

        $('#messages').append($('<li class="pure-menu-link">')
            .text(message));
    });
});

function updateUserList($userList, userList) {
    $userList.append($('<li class="pure-menu-heading">').text('접속자 리스트'));

    for (var user in userList) {
        $userList.append($('<li class="pure-menu-link user-id">')
            .text(user)
            .data('uuid', userList[user].userUUID)
            .data('socketId', userList[user].socketId));
    }
}

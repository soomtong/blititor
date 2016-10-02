var socket = io();

$(document).ready(function () {
    var $userList = $('#users');
    var $publicForm = $('#public');
    var $privateForm = $('#private');
    var $messages = $('#messages');

    $publicForm.submit(function () {
        var message = $('#message_pub');

        socket.emit('chat message', {
            msg: message.val()
        });

        message.val('');

        return false;
    });

    $privateForm.submit(function () {
        var nickname = $('#nickname');
        var message = $('#message_pri');

        socket.emit('chat message', {
            nickname: nickname.val(),
            msg: message.val()
        });

        $messages.append($('<li class="pure-menu-link">')
            .text(nickname.val() + '에게 귓속말 : ' + message.val()));

        nickname.val('');
        message.val('');

        $('#private_chat_pop').bPopup().close();

        return false;
    });

    $(document).on('click', '#users li.user-id', function () {
        var $nickname = $(this).text();
        var socketId = $(this).data('socketId');

        if (socketId == '/#' + socket.id) {
            return alert('나에게 귓속말을 보낼 수 없습니다');
        }

        $('#receiver').text($nickname);
        $('#nickname').val($nickname);

        $('#private_chat_pop').bPopup();
    });

    socket.on('join', function (data) {
        $userList.find('li.user-id').remove();
        updateUserList($userList, data)
    });

    socket.on('leave', function (data) {
        $userList.find('li.user-id').remove();
        updateUserList($userList, data)
    });

    socket.on('chat message', function (data) {
        var message = '';

        if (data.chat_type == "public") {
            message = data.nickname + ' : ' + data.msg;
        } else if (data.chat_type == "private") {
            message = data.nickname + '으로부터의 귓속말 : ' + data.msg;
        }

        $messages.append($('<li class="pure-menu-link">')
            .text(message));
    });
});

function updateUserList($userList, userList) {
    for (var user in userList) {
        $userList.append($('<li class="pure-menu-link user-id">')
            .text(user)
            .data('uuid', userList[user].userUUID)
            .data('socketId', userList[user].socketID));
    }
}

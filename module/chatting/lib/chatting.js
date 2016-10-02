var fs = require('fs');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');

// chatting module requires account module
var Account = require('../../account');

var db = require('./database');

function writeChattingLog(chatInfo, callback) {
    var mysql = connection.get();

    db.writeChattingLog(mysql, chatInfo, function (err, result) {
        if (err || !chatInfo) {
            return callback(err, null);
        }

        callback(err, result);
    });
}

function initSocketWrapper(io, callback) {
    var userCount = 1;
    var currentUserList = {};

    winston.info('Initialized socket io for socket events');

    io.sockets.on('connection', function (socket) {
        winston.verbose('a user connected');

        var nickname;
        var session = socket.request.session;
        var uuid = session.passport ? session.passport['user'] : null;

        if (uuid) {
            Account.findUserByUUID(uuid, function (err, data) {
                nickname = data.nickname;

                currentUserList[nickname] = {
                    socketID: socket.id,
                    userUUID: uuid
                };

                io.sockets.emit('join', currentUserList);
            });
        } else {
            nickname = 'GUEST-' + userCount;

            userCount++;

            currentUserList[nickname] = {
                socketID: socket.id,
                userUUID: null
            };

            io.sockets.emit('join', currentUserList);
        }

        socket.on('chat message', function (data) {
            var whisperCheck = false;
            var to_uuid;

            if (typeof data.nickname != 'undefined') {
                whisperCheck = true;
            }

            if (whisperCheck) {
                to_uuid = currentUserList[data.nickname].socketID;

                var toUserUUID = currentUserList[data.nickname].userUUID;

                if (uuid == toUserUUID) return;
            } else {
                to_uuid = "broadcast";
            }

            var chatInfo = {
                from_uuid: uuid,
                to_uuid: to_uuid,
                message: data.msg,
                created_at: new Date()
            };

            // todo: 귓속말 기능이 구현되면 to_uuid 에 대상을 할당해주는 부분이 필요합니다.

            writeChattingLog(chatInfo, function (error, result) {
                winston.verbose("Insert a chatting log to database.", result.insertId);
            });

            data.nickname = nickname;

            if (whisperCheck) {
                data.chat_type = "private";

                io.sockets.sockets[to_uuid].emit('chat message', data);
            } else {
                data.chat_type = "public";

                io.emit('chat message', data);
            }
        });

        socket.on('disconnect', function (data) {
            winston.verbose('a user disconnected');

            delete currentUserList[nickname];

            if (!uuid) {
                userCount--;
            }

            io.sockets.emit('leave', currentUserList)
        });

    });

    callback && callback();
}

function index(req, res) {
    var params = {
        title: 'chatting'
    };

    res.render(BLITITOR.config.site.theme + '/page/chatting', params);
}

module.exports = {
    index: index,
    initSocket: initSocketWrapper
};
var fs = require('fs');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules
var db = require('./database');

function index(req, res) {
    var params = {
        title: 'chatting'
    };
    res.render(BLITITOR.config.site.theme + '/page/chatting', params);
}

function socketWrapper(io, callback){
    var userCount = 1;
    var currentUserList = {};

    io.sockets.on('connection', function(socket){
        winston.verbose('a user connected');
        var session = socket.request.session, nickname;
        var uuid = session.passport.user;
        console.log(uuid);
        if(uuid){
            findAccountByUUID(uuid, function(err, data){
                nickname = data.nickname;
                currentUserList[nickname] = socket.id;
                io.sockets.emit('join', currentUserList);
            })
        }
        else{
            nickname = 'GUEST-' + userCount;
            userCount ++;
            currentUserList[nickname] = socket.id;
            io.sockets.emit('join', currentUserList);
        }

        socket.on('chat message', function(data){
            var chatInfo = {
                from_id: uuid,
                to_id: "broadcast",
                message: data.msg,
                created_at: new Date()
            };

            // todo: 귓속말 기능이 구현되면 to_id에 대상을 할당해주는 부분이 필요합니다.

            writeChattingLog(chatInfo, function(result){
                console.log("Insert a chatting log to database.");
            });

            data.nickname = nickname;
            io.emit('chat message', data);
        });

        socket.on('disconnect', function(data){
            winston.verbose('a user disconnected');
            delete currentUserList[nickname];
            if(!uuid){
                userCount--;
            }
            io.sockets.emit('leave', currentUserList)
        });

    });

    callback && callback();
}

function findAccountByUUID(UUID, callback) {
    var mysql = connection.get();

    db.readByUUID(mysql, UUID, function (err, account) {
        if (err || !account) {
            // return Error("Can't Find by This UUID");
            return callback(err, null);
        }
        callback(err, account);
    });
}

function writeChattingLog(chatInfo, callback){
    var mysql = connection.get();

    db.writeChattingLog(mysql, chatInfo, function (err, result) {
        if (err || !chatInfo) {
            return callback(err, null);
        }
        callback(err, result);
    });
}

module.exports = {
    index: index,
    socketWrapper: socketWrapper
};
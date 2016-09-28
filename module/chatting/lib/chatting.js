var fs = require('fs');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var connection = require('../../../core/lib/connection');   // todo: can load from CLI modules
var db = require('./database');
var query = require('./query');

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

        if(session.passport.user){
            // todo: uuid를 통해서 db에서 유저정보를 가져오는 코드
            nickname = session.passport.user;
            socket.logged = true;
        }
        else{
            nickname = 'GUEST-' + userCount;
            userCount ++;
        }

        currentUserList[nickname] = socket.id;

        io.sockets.emit('join', currentUserList);

        socket.on('chat message', function(data){
            //var chatInfo = {
            //    from_id: "",
            //    to_id: "",
            //    message: data.msg,
            //    created_at: new Date()
            //};
            //
            //db.writeChattingLog(connection, chatInfo, function(err){
            //    console.log('Insert a chattingLog to database.');
            //});

            data.nickname = nickname;
            io.emit('chat message', data);
        });

        socket.on('disconnect', function(data){
            winston.verbose('a user disconnected');
            delete currentUserList[nickname];
            socket.emit('leave', Object.keys(currentUserList))
        });

    });

    callback && callback();
}

module.exports = {
    index: index,
    socketWrapper: socketWrapper
};
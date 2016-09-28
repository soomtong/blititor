var fs = require('fs');
var winston = require('winston');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');
var connection = require('../../../core/lib/connection');

function index(req, res) {
    var params = {
        title: 'chatting'
    };
    res.render(BLITITOR.config.site.theme + '/page/chatting', params);
}

function socketWrapper(io, next){
    var userCount = 1;
    var currentUserList = {};
    try{
        io.sockets.on('connection', function(socket){
            winston.verbose('a user connected');
            var session = socket.request.session, nickname;

            if(session.passport.user){
                // uuid를 통해서 db에서 유저정보를 가져오는 코드
                nickname = session.passport.user;
            }
            else{
                nickname = 'GUEST-' + userCount;
                userCount ++;
            }

            currentUserList[nickname] = socket.id;

            io.sockets.emit('join', currentUserList);

            socket.on('chat message', function(data){
                data.nickname = nickname;
                io.emit('chat message', data);
            });

            socket.on('disconnect', function(data){
                winston.verbose('a user disconnected');
                delete currentUserList[nickname];
                socket.emit('leave', Object.keys(currentUserList))
            });

        });
        next();
    }catch(e){
        next(e);
    }



}

module.exports = {
    index: index,
    socketWrapper: socketWrapper
};
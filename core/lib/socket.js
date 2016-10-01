var winston = require('winston');

function bindSession(sessionMiddleware) {
    winston.info('Started to bind global session to socket.io system');

    return function (socket, next) {
        sessionMiddleware(socket.request, socket.request.res, next);
    };
}

module.exports = {
    bindSession: bindSession
};
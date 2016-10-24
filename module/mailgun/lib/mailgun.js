var fs = require('fs');
var path = require('path');
var winston = require('winston');
var mailgun = require('mailgun-js');
var mailcomposer = require('mailcomposer');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var mailgunToken = misc.serviceToken('mailgun');
var mailgunProvider = misc.serviceProvider('mailgun');

function sendMail(composer, mailer, receiver) {
    composer.build(function (mailBuildError, message) {
        var dataToSend = {
            to: receiver.email,
            message: message.toString('ascii')
        };

        mailer.messages().sendMime(dataToSend, function (sendError, body) {
            if (sendError) {
                return winston.error(sendError);
            }

            winston.info('Sent mailgun mail to', receiver.email);
        });
    });
}

function mailgunMessage1(receiver) {
    var mailer = mailgun({apiKey: mailgunToken, domain: mailgunProvider});

    var mailTitle = `KOSSCON 2016 사전 신청이 ${receiver.mode} 되었습니다.`;
    var mailSender = '"KossCon 관리자" <kosscon@kosslab.kr>';

    // send updated confirm mail
    fs.readFile(path.join(BLITITOR.root, 'theme', BLITITOR.config.site.theme, 'page', 'register', 'confirm.html'), function (err, confirmHtml) {
        if (err) return winston.error("Can't read confirm mail html template");

        fs.readFile(path.join(BLITITOR.root, 'theme', BLITITOR.config.site.theme, 'page', 'register', 'confirm.txt'), function (err, conformText) {
            if (err) return winston.error("Can't read confirm mail text template");

            var composer = mailcomposer({
                from: mailSender,
                to: receiver.email,
                subject: mailTitle,
                body: conformText.toString().replace('[[*1*]]', receiver.name).replace('[[*2*]]', receiver.mode),
                html: confirmHtml.toString().replace('[[*1*]]', receiver.name).replace('[[*2*]]', receiver.mode)
            });

            // sendMail(composer, mailer, receiver);

            composer.build(function (mailBuildError, message) {
                var dataToSend = {
                    to: receiver.email,
                    message: message.toString('ascii')
                };

                mailer.messages().sendMime(dataToSend, function (sendError, body) {
                    if (sendError) {
                        return winston.error(sendError);
                    }

                    winston.info('Sent mailgun mail to', receiver.email);
                });
            });
        });
    });
}

module.exports = {
    sendKossconMail: mailgunMessage1
};

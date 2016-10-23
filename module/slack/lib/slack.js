var winston = require('winston');
var request = require('superagent');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

var slackToken = misc.serviceToken('slack');
var slackProvider = misc.serviceProvider('slack');

function sendSlackMessage(message, channel) {
    var slackAPI = {
        "uri": slackProvider,
        "token": slackToken,
        "channel": channel
    };

    request
        .post(slackAPI.uri)
        .type('form')
        .send({
            token: slackAPI.token,
            channel: slackAPI.channel,
            text: message})
        .end(function (error, response) {
            // Calling the end function will send the request
            if (error || !response.body.ok) console.log(error, response.body.ok);
        });
}

module.exports = {
    sendMessage: sendSlackMessage
};

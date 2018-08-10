var request = require('request');

var common = require('../../../core/lib/common');
var misc = require('../../../core/lib/misc');

function registerManager(phone) {
    var smsToken = misc.serviceToken('sms_api');
    var smsProvider = 'http://api.apistore.co.kr/ppurio/2/sendnumber/save/kosslab';

    request({
        uri: smsProvider,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-waple-authorization': smsToken
        },
        encoding: 'utf8',
        json: true,
        formData: {
            sendnumber: phone,
            comment: 'manager2018',
            pintype: 'SMS',
            pincode: '234822'
        }
    }, function (error, response, body) {
        console.log(body)
        if (response.statusCode == 200 && body['result_code'] == '200') {
            console.log({
                "status": "success",
                "data": {
                    "phone": phone
                }
            });
        } else {
            console.error('register sms manager to ' + phone);

            console.log({
                "status": "fail",
                "data": {
                    "phone": phone
                }
            });
        }
    });
}

registerManager('01045151082')

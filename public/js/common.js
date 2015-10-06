var blititor = {};

blititor.db = {
    initForm: function ($form) {
        $form.find('button:submit').attr('disabled', 'disabled');
    },
    checkForm: function ($form, callback) {
        var params = {};

        callback(params);
    },
    saveForm: function (params) {

        console.log(params);

        return true;
    }
};
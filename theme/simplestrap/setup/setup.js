var blititor = {};

blititor.db = {
    _form: null,
    initForm: function ($form) {
        this._form = $form;

        this.hideMessage();
        this.watchForm();
    },
    watchForm: function () {
        var form = this._form;
        var formFields = form.find('input[type=text],input[type=password]');

        formFields.on('change', function (e) {
            var pass = true;

            formFields.map(function (index) {
                if (!formFields.eq(index).val()) {
                    pass = false;
                }
            });

            if (pass) {
                form.find('button:submit').attr('disabled', false);
            } else {
                form.find('button:submit').attr('disabled', true);
            }
        });
    },
    checkForm: function () {
        var form = this._form;

        // validate
        console.log(form.find('#db_host').val());
        console.log(form.find('#db_port').val());
        console.log(form.find('#db_id').val());
        console.log(form.find('#db_password').val());

        //this.hideMessage();
        this.showMessage();

        return true;
    },
    submitForm: function (done, fail) {
        var form = this._form;

        console.log('submit!',form);

        if (true) {
            done();
        } else {
            fail();
        }
    },
    saveDone: function () {
        var form = this._form;

        // load partial to go next page
    },
    saveFail: function () {
        this.showMessage('서버 전송 실패');
    },
    showMessage: function (msg) {
        var form = this._form;

        if (msg) {
            form.find('div.message p.text').text(msg);
        }

        form.find('div.message').attr('hidden', false);
    },
    hideMessage: function () {
        var form = this._form;

        form.find('div.message').attr('hidden', true);
    }
};
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
        var formFields = form.find('input[name=db_host],input[name=db_user_id],input[type=password]');
        var formSummitButton = form.find('button:submit');

        formSummitButton.attr('disabled', true);

        formFields.keyup(function (e) {
            var pass = true;

            formFields.map(function (index) {
                if (!formFields.eq(index).val()) {
                    pass = false;
                }
            });

            if (pass) {
                formSummitButton.attr('disabled', false);
            } else {
                formSummitButton.attr('disabled', true);
            }
        });
    },
    checkForm: function () {
        var form = this._form;
        var checkList = [
            form.find('#db_host').val(),
            //form.find('#db_port').val(),
            //form.find('#db_name').val(),
            form.find('#db_user_id').val(),
            form.find('#db_user_password').val()
        ];

        // validate
        for (var index in checkList) {
            if (!checkList[index] || checkList[index] === '') {
                this.showMessage('<strong>경고!</strong> 부족한 내용이 있습니다.');

                return false;
            }
        }
        this.hideMessage();

        return true;
    },
    submitForm: function (done, fail) {
        var form = this._form;
        var formActionURL = form.prop('action');    // use prop() over attr()

        // ajax call
        $.post(formActionURL, form.serialize()).done(done.bind(this)).fail(fail.bind(this));
/*
        // bind this context
        $.post(formActionURL, formData).done(function () {
            done.bind(that)();
        }).fail(function () {
            fail.bind(that)();
        });
*/
    },
    saveDone: function (data) {
        var form = this._form;

        // load partial to go next page
        form.replaceWith(data);
    },
    saveFail: function () {
        this.showMessage('<strong>경고!</strong> 서버로 내용 전송에 실패하였습니다.');
    },
    showMessage: function (msg) {
        var form = this._form;
        var that = this;

        if (msg) {
            form.find('div#message p.text').html(msg);
        }

        form.find('div#message').attr('hidden', false);
        form.find('div#message > button.close').on('click', function (e) {
            e.preventDefault();

            that.hideMessage();
        });
    },
    hideMessage: function () {
        var form = this._form;

        form.find('div#message').attr('hidden', true);
        form.find('div#message > button.close').off('click');
    }
};
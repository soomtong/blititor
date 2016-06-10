// todo: need auto generation script
var moduleList = {
    account: {
        id: 'account',
        active: true,
        title: 'Account',
        mandatory: true,
        table: [
            {user: 'b_user'},
            {auth: 'b_auth'},
            {point: 'b_point'}
        ]
    },
    guestbook: {
        id: 'guestbook',
        active: true,
        title: 'Guestbook',
        table: [
            {guestbook: 'b_guestbook'}
        ]
    }
};

module.exports = {
    list: moduleList
};
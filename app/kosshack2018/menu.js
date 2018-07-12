var StaticMenu = [    // for plain page used by site.plain method (this page has each urls, not included modules)
    {
        id: 'index',
        name: '홈',
        url: '/'
    },
    {
        id: 'schedule_table',
        name: '스케줄',
        url: '/schedule'
    },
    {
        id: 'project_list',
        name: '프로젝트',
        url: '/project'
    },
    // {
    //     id: 'volunteer_list',
    //     name: '참여자',
    //     url: '/volunteer'
    // },
    // {
    //     id: 'hackathon_gallery',
    //     name: '갤러리',
    //     url: '/gallery'
    // },
    {
        id: 'hackathon_qna',
        name: '문의사항',
        url: '/guestbook'
    }
];

var AdminMenu = [
    {
        id: 'index',
        name: '관리자 홈',
        url: '/admin'
    },
    {
        id: 'new',
        name: '신규 계정 생성',
        url: '/admin/new'
    },
    {
        id: 'manage',
        name: '운영',
        url: '/manage'
    }
];

var ManagerMenu = [
    {
        id: 'index',
        name: '운영자 홈',
        url: '/manage'
    },
    {
        id: 'account',
        name: '계정',
        url: '/manage/account'
    },
    {
        id: 'gallery',
        name: '갤러리',
        url: '/manage/gallery'
    },
    {
        id: 'guestbook',
        name: '방명록 관리',
        url: '/manage/guestbook'
    }
];

module.exports = StaticMenu;
module.exports.AdminMenu = AdminMenu;
module.exports.ManagerMenu = ManagerMenu;
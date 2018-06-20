// static page menu describe here
var StaticMenu = [
    {
        id: 'index',
        name: '서울건축문화재',
        url: '/'
    },
    {
        id: 'about',
        name: '소개',
        url: '/about'
    },
    {
        id: 'brief',
        name: '개요',
        useSubPath: true,
        url: '/about/brief'
    },
    {
        id: 'about_director',
        name: '총감독 소개',
        useSubPath: true,
        url: '/about/director'
    },
    {
        id: 'about_location',
        name: '전시장 안내',
        useSubPath: true,
        url: '/about/location'
    },
    {
        id: 'history',
        name: '역대 서울건축문화재',
        url: '/history'
    },
    {
        id: 'register',
        name: '프로그램 신청',
        url: '/register'
    },
    {
        id: 'program',
        name: '프로그램',
        url: '/program'
    },
    {
        id: 'program_opening',
        name: '개막식',
        useSubPath: true,
        url: '/program/opening'
    },
    {
        id: 'program_main',
        name: '본전시',
        useSubPath: true,
        url: '/program/main'
    },
    {
        id: 'program_special',
        name: '특별전시',
        useSubPath: true,
        url: '/program/special'
    },
    {
        id: 'program_idea',
        name: '대학상 아이디어 공모전',
        useSubPath: true,
        url: '/program/idea'
    },
    {
        id: 'program_ceremony',
        name: '서울시 건축상',
        useSubPath: true,
        url: '/program/ceremony'
    },
    {
        id: 'voice',
        name: '시민참여',
        url: '/voice'
    },
    {
        id: 'tour',
        name: '건축문화투어',
        url: '/tour'
    },
    {
        id: 'schedule',
        name: '일정',
        url: '/schedule'
    },
    {
        id: 'notice',
        name: '공지사항',
        url: '/notice'
    }
];

var AdminMenu = [];

var ManagerMenu = [];

module.exports = StaticMenu;
module.exports.AdminMenu = AdminMenu;
module.exports.ManagerMenu = ManagerMenu;
// static page menu describe here
const SiteMenu = [
    {
        id: 'index',
        name: '서울건축문화제',
        url: '/'
    },
    {
        id: 'about',
        name: '소개',
        url: '/about'
    },
    {
        id: 'program',
        name: '프로그램',
        url: '/program'
    },
    {
        id: 'notice',
        name: '공지사항',
        url: '/notice'
    },
    {
        id: 'archive',
        name: '아카이브',
        url: '/archive'
    },
    {
        id: 'about_location',
        name: '전시 안내',
        useSubPath: true,
        url: '/about/location'
    },
    {
        id: 'about_award',
        name: '서울시 건축상',
        useSubPath: true,
        url: '/about/award'
    },
    {
        id: 'about_idea',
        name: '대학생 아이디어 공모전',
        useSubPath: true,
        url: '/about/idea'
    },
    {
        id: 'program_opening',
        name: '개막식',
        useSubPath: true,
        url: '/program/opening'
    },
    {
        id: 'program_main',
        name: '전시',
        useSubPath: true,
        url: '/program/main'
    },
    {
        id: 'tour',
        name: '건축문화투어',
        useSubPath: true,
        url: '/program/tour'
    },
    {
        id: 'voice',
        name: '시민참여',
        useSubPath: true,
        url: '/program/voice'
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
        id: 'gallery',
        name: '갤러리',
        url: '/gallery'
    },
    {
        id: 'archive_2017',
        name: '아카이브',
        useSubPath: true,
        url: '/archive/2017'
    },
    {
        id: 'archive_2016',
        name: '아카이브',
        useSubPath: true,
        url: '/archive/2016'
    },
    {
        id: 'archive_2015',
        name: '아카이브',
        useSubPath: true,
        url: '/archive/2015'
    },
    {
        id: 'archive_2014',
        name: '아카이브',
        useSubPath: true,
        url: '/archive/2014'
    },
    {
        id: 'archive_2013',
        name: '아카이브',
        useSubPath: true,
        url: '/archive/2013'
    },
    {
        id: 'archive_2012',
        name: '아카이브',
        useSubPath: true,
        url: '/archive/2012'
    },
    {
        id: 'archive_2011',
        name: '아카이브',
        useSubPath: true,
        url: '/archive/2011'
    },
    {
        id: 'archive_2010',
        name: '아카이브',
        useSubPath: true,
        url: '/archive/2010'
    },
    {
        id: 'archive_2009',
        name: '아카이브',
        useSubPath: true,
        url: '/archive/2009'
    },
];

const AdminMenu = [];

const ManageMenu = [];

module.exports = {
    SiteMenu: SiteMenu,
    AdminMenu: AdminMenu,
    ManageMenu: ManageMenu,
};
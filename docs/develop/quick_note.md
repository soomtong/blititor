# Dev Note

## Development Log

### `misc.js` or `common.js` in core

- misc: domain specific functions
- common: it's a common used functions

### how to set Fish shell environment variable 

```
set -x NODE_ENV production
```

### Service Provider Token

describe in `config.json` like below

```
"service": {
    "slack": {
        "token": "1234--9898"
    },
    "mailgun": {
        "token": "1212--8882"
    } 
}
```

### Page's title in a browser

there are locals exposing routines in each steps

- site.title: defined in `BLITITOR.config.site.application.title` at `core/index.js`
- app.title: defined in each application's `menu.js`
- title: defined in each response pages
 
u can use this locals in every html pages, like this.

```
<title>{{app.title}} - {{site.title}}</title>
```
or
```
<title>{{title | default(app.title)}} - {{site.application.title}}</title>
```

### Account Sessions

Referred passport session convention for all account methods (admin login or manager login)

> passport session has `user.uuid` only
    
- serialize by `auth.id` or `user.auth_id`
- deserialize by `user.uuid`

> but common req.user has `account` object that has `user_id` (from `auth`), `uuid`, `nickname`, `level`...

thou u should use above pattern, use `auth.id` (or `user.auth_id`)
for custom account process.
 
e.g `req.logIn`


### reason why we need a file `menu.js` in app folder

> App 폴더의 menu.js 의 역할

모든 페이지가 모듈의 기능을 가지고 있지 않기 때문에 (특히 이벤트 페이지 등)
특정 url 과 html 페이지를 연결하기 위해서 몇몇 정보들이 필요합니다.

이때 사용되는 것이 Menu 객체(변수)구요.

```
var SiteMenu = [    // for plain page used by site.plain method (this page has each urls, not included modules)
    {
        id: 'index',
        name: 'KossLab Hackathon 2016',
        url: routeTable.root
    },
    {
        id: 'hackathon_status',
        name: 'Hackathon Status',
        url: '/status'
    },
    {
        id: 'volunteer_list',
        name: 'Volunteer List',
        url: '/volunteer'
    },
    {
        id: 'project_list',
        name: 'Project List',
        url: '/project'
    }
];
```

여기에 선언을 하고 실제 브라우저에서 접근하면 페이지 없다고 (404) 띄웁니다. (성공) 이제 페이지 만들어서  HTML  코딩하면 되죠.

블리티터 컨벤션은 저 Menu 에서 선언한 url 의 마지막 단어를 추출해서 파일 명으로 assign 하고 있구요.

```
function plainPage(req, res) {

    var params = {
        title: "Plain",
        path: req.path,
        page: req.path == '/' ? 'index' : req.path.match(filter.page)[1].replace(/-/g, '_'),
    };

    // winston.info(req.path, params, req.path.match(filter.page));
    // console.log(res.locals.menu);

    res.render(BLITITOR.config.site.theme + '/page/' + params.page, params);
}
```

이 부분이 복잡하긴 하지만 제 나름대로 엄청 고민해서 난이도(수위)를 조절하고 이 정도면 편리함 + 쉬움을 만족할 수 있겠다고 판단했습니다.

페이지쪽 작업할 때 참고하세요.

현재 kosshack2016 앱과 테마가 이 기능을 잘 쓰고 있어요.

### Winston Log Level

- error: 0,
- warn: 1,
- info: 2,
- verbose: 3,
- debug: 4,
- silly: 5


### json result convention

need to define result or post parameter structure

it referred [JSON API Format](http://jsonapi.org/format/) document and [JSend Spec](https://labs.omniti.com/labs/jsend) document

```json
{
    "status": "fail",
    "data": "result data"
}
```

or 

```json
{
    "status": "success",
    "data": { "title": "some values" } 
}
```

or

```json
{
    "status" : "error",
    "message" : "Unable to communicate with database"
}
```

### session counter

> sometime we need to implement own session counter.

blititor uses express.js session system with external session store for mysql. 
it's name is express-mysql-session.

but there is no checker or callback when a new session created. 
and that store module saves only it's session with simple mysql query.

I was forking that repo. and dug a little. but it related with express session system. 
when i found that, i stopped modifying. 
because it's better to keep simple and separated alone each libraries than to update perfect with hacking something.

finally, i decided to make a helper module in the counter system.
just make one more database table and some code in it.

someone think this is verbose a little. 
but this is still elegant implementation for keep 3rd party modules and core libraries. 

### module structure

each module has below structure

```
┌──────────┐ ┌──────────────────┐
│  index   │ │      route       │
└──────────┘ └──────────────────┘
             ┌──────────────────┐
             │    menu, page    │
             └──────────────────┘
             ┌─────────────┐ ┌──────────────────┐
             │     lib     │ │   core library   │
             └─────────────┘ └──────────────────┘
                             ┌──────────────────┐
                             │    middleware    │
                             └──────────────────┘
                             ┌──────────────────┐ ┌────────────────────────┐
                             │     database     │ │   query, dummy json    │
                             └──────────────────┘ └────────────────────────┘
```

### router structure

router has a hierarchy. sub-system router has own Router() instance.
it return and export to the top. and finally bind a express application.

```
┌─────────────┐
│    index    │ express.js Application
└─────────────┘
       │
       └───┐
           ▼   core/route.js
    ┌─────────────┐    ┌─────────────┐
    │             │◀───│ middleware  │ core/middleware.js
    │ core router │    ├─────────────┤
    │             │◀───│ static page │
    └─────────────┘    └─────────────┘
           │
           └───┐
               ▼   application/{moduleName}/{menu.js, page.js}
        ┌──────────────┐
        │     each     │
        │ applications │     ┌──────────────┐
        │    router    │◀────│ bind methods │  module/{moduleName}/route.js
        └──────────────┘     └──────────────┘
                │
        ┌───────┴─────────┬─────────────────┐  module/{moduleName}/lib/{moduleName}.js
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│     each     │  │     each     │  │     each     │ ◀────┌──────────────┐
│   modules    │  │   modules    │  │   modules    │ ◀────│  middleware  │
│    router    │  │    router    │  │    router    │ ◀────└──────────────┘
└──────────────┘  └──────────────┘  └──────────────┘
```

### site id

blititor had a site id for multiple theme site for only one web service before
today, site id removed, no site id exist. it's not necessary for that blititor to be.

use just another database and node.js application for each service.
it's more concise.

### make db stuffs

use just cli command. it is more convenience for developers and do not have a session trouble. it's not `php`
blititor is not suitable for every one who is not a web developer.

```
blititor> node core/setup
```
or
```
blititor> node core/setup all
```
is equals
```
blititor> node core/setup config
blititor> node core/setup init
blititor> node core/setup template
```

## Convention

refer `docs/develop/convention.md` go to [Convention](docs/develop/convention.md)

## theme

each theme include setup, admin (manager), site, board. and have fallback if not exist these folders

### directory

setup
: setup

admin
: admin

manage
: manager



## MariaDB with Sphinx

$ mysql.server start

$ mysql -uroot

> SHOW ENGINES;

> INSTALL SONAME 'ha_sphinx';

```shell
MariaDB [(none)]> show engines;
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                                                    | Transactions | XA   | Savepoints |
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
| CSV                | YES     | CSV storage engine                                                         | NO           | NO   | NO         |
| InnoDB             | DEFAULT | Percona-XtraDB, Supports transactions, row-level locking, and foreign keys | YES          | YES  | YES        |
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables                  | NO           | NO   | NO         |
| MyISAM             | YES     | MyISAM storage engine                                                      | NO           | NO   | NO         |
| MRG_MyISAM         | YES     | Collection of identical MyISAM tables                                      | NO           | NO   | NO         |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                                         | NO           | NO   | NO         |
| Aria               | YES     | Crash-safe tables with MyISAM heritage                                     | NO           | NO   | NO         |
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+

MariaDB [(none)]> INSTALL SONAME 'ha_sphinx';
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> show engines;
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
| Engine             | Support | Comment                                                                    | Transactions | XA   | Savepoints |
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+
| CSV                | YES     | CSV storage engine                                                         | NO           | NO   | NO         |
| InnoDB             | DEFAULT | Percona-XtraDB, Supports transactions, row-level locking, and foreign keys | YES          | YES  | YES        |
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables                  | NO           | NO   | NO         |
| MyISAM             | YES     | MyISAM storage engine                                                      | NO           | NO   | NO         |
| MRG_MyISAM         | YES     | Collection of identical MyISAM tables                                      | NO           | NO   | NO         |
| SPHINX             | YES     | Sphinx storage engine 2.2.6-release                                        | NO           | NO   | NO         |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                                         | NO           | NO   | NO         |
| Aria               | YES     | Crash-safe tables with MyISAM heritage                                     | NO           | NO   | NO         |
+--------------------+---------+----------------------------------------------------------------------------+--------------+------+------------+


CREATE TABLE t1
(
    id          BIGINT UNSIGNED NOT NULL,
    weight      INTEGER NOT NULL,
    query       VARCHAR(3072) NOT NULL,
    group_id    INTEGER,
    INDEX(query)
) ENGINE=SPHINX CONNECTION="sphinx://localhost:9312/test";

SELECT * FROM t1 WHERE query='test it;mode=any';
```
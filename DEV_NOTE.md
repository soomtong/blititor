# Dev Note

## Development Log

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

### file name

should use lower case for all file system, not camel case, also snake case

incorrect

```
fileName.html
file-name.html
```

correct

```
file_name.html
filename.html
```

### variable name

can use any style, camelcase recommended from many javascript code style

### route name

use lower case for source code, make dash for space or separation for significant

incorrect

```
/account/signUp
/account/sign_up
```

correct

```
/account/sign-in
/account/signin
```


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
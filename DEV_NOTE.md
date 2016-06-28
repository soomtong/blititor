# Dev Note

## Development Log

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


## MariaDB

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
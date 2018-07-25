blititor
========


Easy to custom for the all Web Agencies and Web Masters in Korea

> This code is really easy to customize for your business! - Web developer journal in korean times

![blititor_logo_nodejsstyle7](https://cloud.githubusercontent.com/assets/22411481/18962436/cd87572a-86ab-11e6-8e6b-d145b325e119.png)

(a logo presented by Hyejin Lee @melthleeth)

![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsoomtong%2Fblititor.svg?type=shield)

## Stack

- NodeJS + MysqlDB(MariaDB) + Nginx(Caddy) + Sphinx
- Express.js + Socket.io
- Nunjucks html template
- Jquery and many frontend frameworks
- and wonderful NPM

## Development

- [quick note](docs/develop/quick_note.md)
- [convention](docs/develop/convention.md)
- [mysql manage](docs/develop/mysql_manage.md)
- [menu path system](docs/develop/menu_path_system.md)

## Demo

check out the samples! based awesome css frameworks

- pure
- bulma
- bootstrap
- foundation
- materialize
- kube
- ...

## Usage

prepare git, nodejs, npm, bower

### clone repos

```shell
git clone git://github.com/soomtong/blititor.git
```

### install component with npm and bower

```shell
npm install
bower install
```

### create module_list.json

```shell
node core/setup.js module
```

### database configuration (mysql, mariadb)

```shell
node core/setup.js db
```

### make database tables for blititor

```shell
node core/setup.js db-init
```

for preparing non-core modules ('guestbook' or 'teamblog'...)

```shell
node core/setup.js db-init some_module_name
```

### make theme configuration

```shell
node core/setup.js theme
```

### make admin account

```shell
node core/setup.js admin
```

### run node app

```shell
node core/index
```

or u can override default port using option `port` or `p` 

```
node core/index -port=3000
node core/index -p 3000
```

or run dev mode using nodemon

```
npm run dev
```

## License

Blititor has MIT License basically. but each theme design license depends on each maker's opinions.

it will be described each `app` and `theme`'s readme file or description file.

![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsoomtong%2Fblititor.svg?type=large)
blititor
========


Easy to custom for the all Web Agencies and Web Masters in Korea

> this code is really easy to customize for your business! - web developer journal in korean times

![blititor_logo_nodejsstyle7](https://cloud.githubusercontent.com/assets/22411481/18938134/5bd7305c-8631-11e6-8415-19590e187869.png)

(a logo presented by Hyejin Lee @melthleeth)

## Stack

- NodeJS + MysqlDB(MariaDB) + Sphinx + Nginx (recommended)
- Express.js + Socket.io
- Nunjucks html template
- Jquery and many frontend frameworks
- and wonderful NPM

## Demo

check out the samples! based awesome css frameworks

- pure
- bootstrap
- foundation
- materialize
- kube
- ...

## Usage

prepare git, nodejs, npm

### clone repos

```shell
git clone git://github.com/soomtong/blititor.git
```

### install component with npm

```shell
npm install
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
node core/setup.js theme some_module_name
```

### make theme configuration

```shell
node core/setup.js theme
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

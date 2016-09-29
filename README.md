Blititor
========

Easy to custom for the all Web Agencies and Web Masters in Korea

> This code is really easy to customize for your business! - web developer journal in korean times

## Stack

- NodeJS + MysqlDB(MariaDB) + Sphinx + Nginx (recommended)
- Express.js + Socket.io
- Nunjucks html template
- Jquery and many frontend frameworks
- And wonderful NPM

## Demo

Check out the samples! Based awesome css frameworks

- Pure
- Bootstrap
- Foundation
- Materialize
- Kube
- ...

## Usage

Prepare git, nodejs, npm

### Clone repos

```Shell
git clone git://github.com/soomtong/blititor.git
```

### Install component with npm

```shell
npm install
```

### Create module_list.json

```shell
node core/setup.js module
```

### Database configuration (mysql, mariadb)

```shell
node core/setup.js db
```

### Make database tables for blititor

```shell
node core/setup.js db-init
```

### Make Theme configuration

```shell
node core/setup.js theme
```

### Run node app
```shell
node core/index
```

blititer
========

humble blog application for nodejs using summernote

## stack

- nodejs + mongodb + nginx (recommended)
- express + mongoskin
- jquery + knockout
- bootstrap
- used npm, bower

## usage

- clone repos
```shell
git clone git://github.com/soomtong/blititor.git
```

- prepare nodejs, npm, bower

- edit your config.json file
```shell
cd blititor
cp config.default.json config.js
chmod +x blit.js
```

- install component with npm, bower
```shell
npm install
bower install
```

- generate configuration file, make mongo collection, insert dummy data
```shell
./blit ready
```
for windows
```shell
node blit ready
```

- run server with forever
```shell
./blit start
./blit stop
```
for windows use single node app
```shell
node app.js
```

## for hackers

I wish you can make this better one :)

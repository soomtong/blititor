blititer
========

humble web board for nodejs using summernote

## stack

- nodejs + nginx (recommened) + mongodb
- express + mongoskin
- jquery + knockout
- bootstrap
- used npm, bower

## usage

- clone repos
```shell
git clone git://github.com/soomtong/blititor.git
```

- prepare nodejs, npm, bower, jake

- install component with npm, bower
```shell
cd blititor
npm install
bower install
```

- generate configuration file, make mongo collection, insert dummy data
```shell
node blititor.js ready
```
- run server with forever
```shell
node blititor.js run
```

## for hackers

I wish you can make this better one :)

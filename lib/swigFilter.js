/*
checkout this
http://paularmstrong.github.io/swig/docs/#filters-custom

setup like below
// set template engine
app.engine('html', cons.swig);
swig.init({
    root: __dirname + '/views',
    tags: require('./swigTag'),
    filters: require('./swigFilter'),
    allowErrors: true,
    cache: false
});
*/

/*
* use : {{ someString|substring(10) }}
* */
exports.substring = function (input, count) {
  return input.toString().substr(0, count);
};

/*
* use : {{ myDate|printDate('d') }}
* */
exports.printDate = function (input, type) {
    var str, year, month, day;

    if (input.length == 8 && type != 'd') {
        year = input.slice(0, 4);
        month = input.slice(4, 6);
        day = input.slice(6, 8);

        if (month.length == 2 && month.slice(0,1) == '0') month = month.slice(1, 2);
        if (day.length == 2 && day.slice(0,1) == '0') day = day.slice(1, 2);

        str = month + '월 ' + day + '일';

    } else if (type == 'D') {

        day = input.slice(input.length - 2, input.length);
        if (day.length == 2 && day.slice(0,1) == '0') day = day.slice(1, 2);

        str = day + '일';

    } else {
        day = input.slice(input.length - 2, input.length);
        if (day.length == 2 && day.slice(0,1) == '0') day = day.slice(1, 2);

        str = day;
    }

    return str;
};
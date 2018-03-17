const moment = require('moment');

const time = '20180312210000';

const a = moment(time, 'YYYYMMDDHHmmss').toDate();
console.log(a);

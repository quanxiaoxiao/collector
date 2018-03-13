const {
  encode,
  decode,
} = require('./src/utils');

const aa = encode('sdfsdf');
console.log(decode(aa));

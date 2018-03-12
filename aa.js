const { encode, decode } = require('./utils');

const a = encode('helloquan');

console.log(decode(a));

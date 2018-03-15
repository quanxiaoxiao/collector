const crypto = require('crypto');
// 84935157 ab35595d51b55ce4abab2ffd2f2a623b
const sequence = 84935157;
const key = 1234567812345678;

// const key = Buffer.from('1234567812345678');

// const encipher = crypto.createCipheriv('aes-128-cbc', key, key);

const result = crypto
  .createHash('md5')
  .update(`${key}${sequence}`)
  .digest('hex');

console.log(result);

const crypto = require('crypto');

const startTags = [
  0x8bae9b01,
  0x8bae9b02,
  0x8bae9b03,
  0x8bae9b04,
  0x8bae9b05,
  0x8bae9b06,
  0x8bae9b07,
  0x8bae9b08,
  0x8bae9b09,
  0x8bae9b10,
];

const key = Buffer.from('1234567812345678');

const seekStartPos = (buf) => {
  let pos = 0;
  while (pos + 4 <= buf.length) {
    if (startTags.indexOf(buf.readUInt32BE(pos)) !== -1) {
      return pos;
    }
    pos++;
  }
  return -1;
};

const paddingLength = (padding, size) =>
  (padding * Math.ceil(size / padding)) - size;

const encode = (content) => {
  let contentBuf = Buffer.from(content);
  const lengthPadding = paddingLength(16, contentBuf.length);
  if (lengthPadding > 0) {
    contentBuf = Buffer.concat([
      contentBuf,
      Buffer.alloc(lengthPadding, lengthPadding),
    ], contentBuf.length + lengthPadding);
  }
  const encipher = crypto.createCipheriv('aes-128-cbc', key, key);
  encipher.setAutoPadding(false);
  return encipher.update(contentBuf);
};

const decode = (buf) => {
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, key);
  decipher.setAutoPadding(false);
  return decipher.update(buf, 'binary', 'utf8');
};

const pack = (content, type) => {
  const startHeader = Buffer.from([
    0x8b,
    0xae,
    0x9b,
    type,
  ]);
  const dataLen = Buffer.from([
    0x30,
    0x30,
    0x66,
    0x39,
  ]);
  /*
  const dataLen = Buffer.alloc(4);
  dataLen.writeUInt32LE(contentData.length);
  */
  const contentData = Buffer.from(content, 'utf-8');
  return Buffer.concat([
    startHeader,
    dataLen,
    contentData,
  ], 4 + 4 + contentData.length);
};

module.exports = {
  seekStartPos,
  encode,
  decode,
  pack,
};

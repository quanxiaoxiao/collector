const { Observable } = require('rxjs');
const { Readable } = require('stream');
const { seekStartPos, encode } = require('./utils');

const _data = [];

_data.push('asdfs');
_data.push(Buffer.from([
  0x8b,
  0xae,
  0x9b,
  0x04,
]));
_data.push(Buffer.from([
  0x11,
  0x00,
  0x00,
  0x00,
]));
_data.push('===asdfs8s12345678');
_data.push('ccccccccc');
_data.push(Buffer.from([
  0x8b,
  0xae,
  0x9b,
  0x08,
]));
_data.push(Buffer.from([
  0x11,
  0x00,
  0x00,
  0x00,
]));
_data.push('asdf111111111111111111111[  h');
_data.push('asdfs');
_data.push('asdfs');
_data.push('asdfs');
_data.push('asdfs');

const reader = Readable({
  read() {
    const d = _data.shift();
    if (d) {
      this.push(d);
    } else {
      this.push(null);
    }
  },
});

Observable.fromEvent(reader, 'data')
  .map(chunk => (state) => {
    const buf = Buffer.concat([state.buf, chunk], state.buf.length + chunk.length);
    const startPos = seekStartPos(buf);
    if (startPos === -1) {
      return {
        buf: buf.length > 40 * 1024 ? Buffer.from([]) : buf,
        data: Buffer.from([]),
        type: null,
      };
    }
    const data = buf.slice(startPos);
    if (data.length < 8) {
      return {
        buf: data,
        data: Buffer.from([]),
        type: null,
      };
    }
    const dataLen = data.readUInt32LE(4);
    if (data.length - 8 < dataLen) {
      return {
        buf: data,
        data: Buffer.from([]),
        type: null,
      };
    }
    return {
      buf: data.slice(dataLen + 8),
      data: data.slice(8, dataLen + 8),
      type: data.readUInt8(3),
    };
  })
  .scan((state, action) => action(state), {
    buf: Buffer.from([]),
    data: Buffer.from([]),
  })
  .filter(state => state.data.length > 0 && state.type !== null)
  .map(state => ({
    type: state.type,
    data: state.data,
  }))
  .subscribe((obj) => {
    console.log(obj.data.toString());
  });


// console.log(encode('hello,world!'));

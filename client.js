const net = require('net');
const requestTemp = require('./request.temp');

const client = new net.Socket();

client.connect(3003, 'localhost', () => {
  client.write(Buffer.from([
    0x8b,
    0xae,
    0x9b,
    0x01,
  ]));
  const request = requestTemp({
    building: 'asdf',
    gateway: '01',
  });
  const dataLen = Buffer.alloc(4);
  console.log(8888);
  dataLen.writeUInt32LE(request.length);
  client.write(dataLen);
  client.write(request);
});

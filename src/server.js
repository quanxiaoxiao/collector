const { Observable } = require('rxjs');
const net = require('net');
const xml2js = require('xml2js');
const Device = require('./Device');
const { seekStartPos } = require('./utils');

const port = 3003;

const TYPE_REQUEST = 0x01;
const TYPE_SEQUENCE = 0x02;
const TYPE_MD5 = 3;
const TYPE_RESULT = 4;
const TYPE_REPORT = 5;
const TYPE_CONTINUOUS = 6;
const TYPE_DATA_ACK = 7;
const TYPE_CONTINUOUS_ack = 8;
const TYPE_NOTIFY = 9;
const TYPE_TIME = 10;

const typeMap = {
  [TYPE_CONTINUOUS]: 'continuous',
  [TYPE_REQUEST]: 'request',
  [TYPE_MD5]: 'md5',
};

const ERROR_TYPE_NOT_EQUAL = 'type is not equal';
const ERROR_GATEWAY_NOT_EXIST = 'building or gateway is not exist';
const ERROR_GATEWAY_NOT_EQUAL = 'building or gateway is not equal';
const ERROR_NOT_AUTH = 'is not auth';

const server = net.createServer((socket) => {
  const device = new Device(socket.remoteAddress);

  Observable.fromEvent(socket, 'data')
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
      console.log(data.slice(4, 8), data.slice(8).length);
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
      type: null,
    })
    .filter(state => state.data.length && state.type !== null)
    .flatMap(chunk => Observable.bindNodeCallback(new xml2js.Parser().parseString)(chunk))
    .map(({ root: { common, ...other } }) => ({
      building: common[0].building_id[0],
      gateway: common[0].gateway_id[0],
      type: common[0].type[0],
      other,
    }))
    .subscribe(({
      building,
      type,
      gateway,
      other,
    }) => {
      console.log('+++++++++++++', building);
      if (type === 'request') {
        device.building = building;
        device.gateway = gateway;
        device.responseSequence();
        return;
      }
      if (device.building !== building || device.gateway !== gateway) {
        return;
      }
      if (type === 'md5') {
        device.responseResult(other.id_validate[0].md5[0]);
        return;
      }
      if (!device.isAuth) {
        return;
      }
      console.log('-------------------->', JSON.stringify(other));
      if (type === 'report' || type === 'continuous' || type === 'continuous_ack') {
        console.log(999);
        device.responseAck({
          type,
          sequence: other.data[0].sequence[0],
        });
      }
    });


  Observable.interval(3000)
    .takeUntil(Observable.fromEvent(socket, 'close'))
    .filter(() => device.isAuth)
    .subscribe(() => {
      device.responseQuery();
    });

  socket.on('close', () => {
    console.log('client close');
  });

  device.on('response', (msg) => {
    socket.write(msg);
    // socket.write(pack(msg));
  });
});


server.listen(port, () => {
  console.log(`socket server at listen port: ${port}`);
});

server.on('error', (error) => {
  console.error('socekt server error:', error);
});

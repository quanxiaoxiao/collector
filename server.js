const { Observable } = require('rxjs');
const net = require('net');
const xml2js = require('xml2js');
const {
  seekStartPos,
  decode,
} = require('./utils');
const Device = require('./Device');

const port = 3003;

const TYPE_REQUEST = 1;
const TYPE_SEQUENCE = 2;
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
};

const ERROR_TYPE_NOT_EQUAL = 'type is not equal';
const ERROR_GATEWAY_NOT_EXIST = 'building or gateway is not exist';
const ERROR_GATEWAY_NOT_EQUAL = 'building or gateway is not equal';
const ERROR_NOT_AUTH = 'is not auth';

const server = net.createServer((socket) => {
  const device = new Device();

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
    .map(({ type, data }) => ({
      type,
      data: (type === TYPE_CONTINUOUS || type === TYPE_REPORT) ? decode(data) : data,
    }))
    .flatMap(({ data, type }) =>
      Observable.bindNodeCallback(new xml2js.Parser().parseString)(data)
        .map(({ root: { common: [common], ...other } }) => {
          if (common.type[0] !== typeMap[type]) {
            throw new Error(ERROR_TYPE_NOT_EQUAL);
          }
          if (!common.building_id[0] || !common.gateway_id[0]) {
            throw new Error(ERROR_GATEWAY_NOT_EXIST);
          }
          if (!device.isAuth && type !== TYPE_REQUEST) {
            throw new Error(ERROR_NOT_AUTH);
          }
          if (device.isAuth &&
            (device.building !== common.building_id[0] ||
            device.gateway !== common.gateway_id[0])) {
            throw new Error(ERROR_GATEWAY_NOT_EQUAL);
          }
          if (!device.gateway) {
            device.gateway = common.gateway_id[0]; // eslint-disable-line
            device.building = common.building_id[0]; // eslint-disable-line
          }
          return {
            type,
            other,
          };
        }))
    .catch((error) => {
      switch (error.message) {
        case ERROR_TYPE_NOT_EQUAL:
          device.responseErrorByTypeNotEqual();
          return;
        case ERROR_GATEWAY_NOT_EXIST:
          device.responseErrorByGatewayNotExist();
          return;
        case ERROR_GATEWAY_NOT_EQUAL:
          device.responseErrorByGatewayNotEqual();
          return;
        case ERROR_NOT_AUTH:
          device.responseErrorNotAuth();
          return;
        default: device.responseErrorByParseXML();
      }
    })
    .subscribe(({ type, other }) => {
      switch (type) {
        case TYPE_REQUEST:
          device.responseSequence();
          break;
        case TYPE_MD5:
          device.responseResult();
          break;
        case TYPE_CONTINUOUS:
        case TYPE_REPORT:
          device.responseAck();
      }
    });

  device.on('response', (msg) => {
    console.log(msg);
  });
});


server.listen(port, () => {
  console.log(`socket server at listen port: ${port}`);
});

server.on('error', (error) => {
  console.error('socekt server error:', error);
});

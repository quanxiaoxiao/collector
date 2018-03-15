const { EventEmitter } = require('events');
const crypto = require('crypto');
const ackTemp = require('./signals/ack.temp');
const sequenceTemp = require('./signals/sequence.temp');
const resultTemp = require('./signals/result.temp');

const TYPE_SEQUENCE = 0x02;
const TYPE_MD5 = 0x03;
const TYPE_DATA_ACK = 7;
const TYPE_CONTINUOUS_ACK = 8;

class Device extends EventEmitter {
  constructor(host) {
    super();
    this.host = host;
    this.building = null;
    this.gateway = null;
    this.isAuth = false;
    this.sequence = null;
    this.md5Salt = '1234567812345678';
  }

  responseSequence() {
    this.sequence = Math.floor((Math.random() * 90000000) + 10000000).toString();
    this.emit('response', sequenceTemp({
      building: this.building,
      gateway: this.gateway,
      sequence: this.sequence,
    }), TYPE_SEQUENCE);
  }

  responseResult(md5) {
    this.isAuth = crypto
      .createHash('md5')
      .update(`${this.md5Salt}${this.sequence}`)
      .digest('hex') === md5;
    this.emit('response', resultTemp({
      building: this.building,
      gateway: this.gateway,
      success: this.isAuth,
    }), TYPE_MD5);
  }

  responseAck({ type, sequence }) {
    this.emit('response', ackTemp({
      building: this.building,
      gateway: this.gateway,
      type,
      sequence,
    }), type === 'report' ? TYPE_DATA_ACK : TYPE_CONTINUOUS_ACK);
  }
}

module.exports = Device;

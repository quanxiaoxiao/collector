const { EventEmitter } = require('events');
const crypto = require('crypto');
const sequenceTemp = require('./signals/sequence.temp');
const resultTemp = require('./signals/result.temp');

class Device extends EventEmitter {
  constructor(host) {
    super();
    this.host = host;
    this.building = null;
    this.gateway = null;
    this.isAuth = false;
    this.sequence = null;
    this.md5Salt = '12345';
  }

  responseSequence() {
    this.sequence = Math.floor((Math.random() * 90000000) + 10000000).toString();
    this.emit('response', sequenceTemp({
      building: this.building,
      gateway: this.gateway,
      sequence: this.sequence,
    }));
  }

  responseResult(md5) {
    this.isAuth = crypto
      .createHash('md5')
      .update(`${this.sequence}${this.md5Salt}`)
      .digest('hex') === md5;
    this.emit('response', resultTemp({
      building: this.building,
      gateway: this.gateway,
      success: this.isAuth,
    }));
  }

  responseAck() {
    console.log('response ack');
  }

  responseErrorByTypeNotEqual() {
    console.log('type error');
  }

  responseErrorByGatewayNotExist() {
    console.log('gateway not exist');
  }

  responseErrorByParseXML() {
    console.log('parse xml error');
  }

  responseErrorByGatewayNotEqual() {
    console.log('gateway not equal');
  }

  responseErrorNotAuth() {
    console.log('not auth');
  }
}

module.exports = Device;

const { EventEmitter } = require('events');
const crypto = require('crypto');
const sequenceTemp = require('./signals/sequence.temp');
const resultTemp = require('./signals/result.temp');
const queryTemp = require('./signals/query.temp');
const heartbeatTemp = require('./signals/heartbeat.temp');

const TYPE_SEQUENCE = 0x02;
const TYPE_MD5 = 0x03;

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
    }), TYPE_SEQUENCE);
  }

  responseResult(md5) {
    // 46217562 eb6c95f789d5a6872b89a7806c6c71ed
    /*
    <?xml version="1.0" encoding="utf-8" standalone="yes" ?>
      <root>
          <common>
                  <building_id>11111111111</building_id>
                          <gateway_id>00090020</gateway_id>
                                  <type>auto_history</type>
                                      </common>
          <supcon operation="auto_history" />
      </root>
      */

    /*
    this.isAuth = crypto
      .createHash('md5')
      .update(`${this.sequence}${this.md5Salt}`)
      .digest('hex') === md5;
      */
    console.log('---------md5', this.sequence, md5);
    this.isAuth = true;
    this.emit('response', resultTemp({
      building: this.building,
      gateway: this.gateway,
      success: this.isAuth,
    }), TYPE_MD5);
  }

  responseHeartbeat() {
    this.emit('response', heartbeatTemp({
      building: this.building,
      gateway: this.gateway,
    }));
  }


  responseQuery() {
    this.emit('response', queryTemp({
      building: this.building,
      gateway: this.gateway,
    }));
  }

  responseAck() {
    console.log('++++++++++++++++response ack');
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

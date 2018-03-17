const { EventEmitter } = require('events');
const crypto = require('crypto');
const moment = require('moment');
const { collector, energy } = require('./controllers');
const ackTemp = require('./signals/ack.temp');
const sequenceTemp = require('./signals/sequence.temp');
const resultTemp = require('./signals/result.temp');

const TYPE_SEQUENCE = 0x02;
const TYPE_MD5 = 0x03;
const TYPE_DATA_ACK = 0x07;
const TYPE_CONTINUOUS_ACK = 0x08;

class Device extends EventEmitter {
  constructor(address) {
    super();
    this.building = null;
    this.gateway = null;
    this.isAuth = false;
    this.sequence = null;
    this.id = null;
    this.address = address;
  }

  offline() {
    collector.offline({
      building: this.building,
      gateway: this.gateway,
    });
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
    collector.find({
      building: this.building,
      gateway: this.gateway,
    }, (error, device) => {
      if (error) {
        return;
      }
      if (device && device.key) {
        this.id = device._id;
        this.isAuth = crypto
          .createHash('md5')
          .update(`${device.key}${this.sequence}`)
          .digest('hex') === md5;
        this.emit('response', resultTemp({
          building: this.building,
          gateway: this.gateway,
          success: this.isAuth,
        }), TYPE_MD5);
        if (this.isAuth) {
          collector.online({
            building: this.building,
            gateway: this.gateway,
            address: this.address,
          });
        }
      }
    });
  }

  responseAck({
    type,
    sequence,
    isLast,
    data,
  }) {
    let flag = TYPE_DATA_ACK;
    if (isLast) {
      flag = TYPE_CONTINUOUS_ACK;
    }
    this.emit('response', ackTemp({
      building: this.building,
      gateway: this.gateway,
      type,
      sequence,
    }), flag);
    const {
      time: [time],
      meter: meters,
    } = data;
    const date = moment(time, 'YYYYMMDDHHmmss').toDate();
    meters.forEach((meter) => {
      const meterId = meter.id[0];
      const functionals = meter['function']; // eslint-disable-line
      functionals.forEach((functional) => {
        const obj = {
          collector: this.id,
          meter: meterId,
          time: date,
          functional: functional.id[0],
          value: parseFloat(functional._),
          coding: functional.coding[0],
        };
        console.log(obj);
        /*
        energy.findOneAndUpdate(obj);
        */
      });
    });
  }
}

module.exports = Device;

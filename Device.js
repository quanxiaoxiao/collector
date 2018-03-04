class Device {
  constructor() {
    this.building = null;
    this.gateway = null;
    this.isAuth = false;
  }

  responseSequence() {
    console.log('response sequence');
  }

  responseResult() {
    console.log('response result');
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

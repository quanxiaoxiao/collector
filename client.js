const net = require('net');
const crypto = require('crypto');
const { pack } = require('./utils');
const xml2js = require('xml2js');
const requestTemp = require('./request.temp');
const md5Temp = require('./md5.temp');

const client = new net.Socket();

const building = '1234';
const gateway = '01';

client.connect(3003, '192.168.1.3', () => {
  client.write(pack(requestTemp({
    building,
    gateway,
  }), 0x01));
});

client.on('data', (data) => {
  const parser = new xml2js.Parser();
  parser.parseString(data.toString(), (error, result) => {
    if (error) {
      return;
    }
    const {
      type: [type],
    } = result.root.common[0];
    if (type === 'sequence') {
      const md5Salt = '12345';
      const {
        sequence: [sequence],
      } = result.root.id_validate[0];

      const md5 = crypto
        .createHash('md5')
        .update(`${sequence}${md5Salt}`)
        .digest('hex');
      client.write(pack(md5Temp({
        md5,
        building,
        gateway,
      }), 0x03));
    } if (type === 'result') {
      console.log(data.toString());
    }
  });
});

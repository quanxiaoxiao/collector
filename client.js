const net = require('net');
const crypto = require('crypto');
const xml2js = require('xml2js');
const requestTemp = require('./request.temp');
const { pack } = require('./src/utils');
const md5Temp = require('./md5.temp');
const reportTemp = require('./report.temp');

const client = new net.Socket();
const key = '1234567812345678';
const building = '11111111111';
const gateway = '00090020';

client.connect(3003, 'localhost', () => {
  client.write(pack(requestTemp({
    building,
    gateway,
  })), 0x01);
});

client.on('data', (chunk) => {
  const parser = new xml2js.Parser();
  console.log(chunk.toString());
  parser.parseString(chunk.slice(8).toString(), (error, doc) => {
    const {
      root: {
        common: [common],
        ...other
      },
    } = doc;
    const [type] = common.type;
    if (type === 'sequence') {
      console.log('++++++++', other.id_validate[0].sequence[0]);
      client.write(pack(md5Temp({
        building,
        gateway,
        md5: crypto
          .createHash('md5')
          .update(`${key}${other.id_validate[0].sequence[0]}`)
          .digest('hex'),
      }), 0x01));
    }
    if (type === 'result') {
      client.write(pack(reportTemp({
        building,
        gateway,
      }), 0x01));
    }
  });
});

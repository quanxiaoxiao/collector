const net = require('net');
const xml2js = require('xml2js');
const requestTemp = require('./request.temp');
const md5Temp = require('./md5.temp');
const reportTemp = require('./report.temp');

const client = new net.Socket();
const building = '11111111111';
const gateway = '00090020';

client.connect(3003, 'localhost', () => {
  client.write(requestTemp({
    building,
    gateway,
  }));
});

client.on('data', (chunk) => {
  const parser = new xml2js.Parser();
  console.log(chunk.toString());
  parser.parseString(chunk.toString(), (error, doc) => {
    const {
      root: {
        common: [common],
      },
    } = doc;
    const [type] = common.type;
    if (type === 'sequence') {
      client.write(md5Temp({
        building,
        gateway,
        md5: 'asdfsdf',
      }));
    }
    if (type === 'result') {
      client.write(reportTemp({
        building,
        gateway,
        md5: 'asdfsdf',
      }));
    }
  });
});

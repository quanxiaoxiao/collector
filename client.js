const net = require('net');
const fs = require('fs');

const client = new net.Socket();

client.connect(3003, 'localhost', () => {
  client.write(fs.readFileSync('./request.signal'));
});

client.on('data', (data) => {
  console.log(data.toString());
  /*
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
  */
});

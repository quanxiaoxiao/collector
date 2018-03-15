const { Observable } = require('rxjs');
const net = require('net');
const xml2js = require('xml2js');
const Device = require('./Device');
const { pack } = require('./utils');

const port = 3003;

const server = net.createServer((socket) => {
  const device = new Device(socket.remoteAddress);

  const close$ = Observable.fromEvent(socket, 'close');
  Observable.fromEvent(socket, 'data')
    .takeUntil(close$)
    .map(chunk => chunk.slice(8))
    .flatMap(chunk => Observable.bindNodeCallback(new xml2js.Parser().parseString)(chunk))
    .map(({ root: { common, ...other } }) => ({
      building: common[0].building_id[0],
      gateway: common[0].gateway_id[0],
      type: common[0].type[0],
      other,
    }))
    .subscribe(({
      building,
      type,
      gateway,
      other,
    }) => {
      if (type === 'request') {
        device.building = building;
        device.gateway = gateway;
        device.responseSequence();
        return;
      }
      if (type === 'md5') {
        device.responseResult(other.id_validate[0].md5[0]);
        return;
      }
      if (!device.isAuth || !device.building || !device.gateway) {
        return;
      }
      console.log('----------type:', type);
      console.log('------------data:', JSON.stringify(other.data));
      if (type === 'report' || type === 'continuous') {
        device.responseAck({
          type: type === 'report' ? 'data' : 'continuous',
          sequence: other.data[0].sequence[0],
        });
      }
    });

  close$.subscribe(() => {
    console.log('client close');
  });


  device.on('response', (msg, type) => {
    socket.write(pack(msg, type));
  });
});


server.listen(port, () => {
  console.log(`socket server at listen port: ${port}`);
});

server.on('error', (error) => {
  console.error('socekt server error:', error);
});

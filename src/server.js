const { Observable } = require('rxjs');
const net = require('net');
const xml2js = require('xml2js');
const Device = require('./Device');
const { pack } = require('./utils');

const port = 3003;

const server = net.createServer((socket) => {
  console.log(`------connection: ${socket.remoteAddress}`);
  const device = new Device(socket.remoteAddress);

  const close$ = Observable.fromEvent(socket, 'close')
    .take(1);

  Observable.fromEvent(socket, 'data')
    .takeUntil(close$)
    .map(chunk => chunk.slice(8))
    .do((chunk) => {
      console.log(chunk.toString());
    })
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
      if (!device.building || !device.gateway) {
        return;
      }
      if (type === 'md5') {
        device.responseResult(other.id_validate[0].md5[0]);
        return;
      }
      if (!device.isAuth) {
        return;
      }

      if (type === 'report' || type === 'continuous') {
        const [data] = other.data;
        let isLast = false;
        if (type === 'continuous' && Array.isArray(data.total) && Array.isArray(data.current)) {
          isLast = data.total[0] === data.current[0];
        }
        device.responseAck({
          type: type === 'report' ? 'data' : 'continuous',
          sequence: data.sequence[0],
          isLast,
          data,
        });
      }
    });

  function response(msg, type) {
    socket.write(pack(msg, type));
  }

  device.on('response', response);

  close$.subscribe(() => {
    device.removeListener('response', response);
    if (device.isAuth) {
      device.offline();
    }
    console.log('---------- client close');
  });
});


server.listen(port, () => {
  console.log(`socket server at listen port: ${port}`);
});

server.on('error', (error) => {
  console.error('socekt server error:', error);
});

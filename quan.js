const { Schema, Types } = require('mongoose');
const { collector, energy } = require('./src/controllers');

const building = '030001';
const gateway = 'BLJY2';
const key = '1234567812345678';
const address = '192.168.0.118';


collector.find({ building, gateway }, (error, device) => {
  energy.queryByCollector(device._id, (err, list) => {
    console.log(list);
  });

/*
  energy.add({
    collector: device._id,
    meter: 'meter',
    functional: 'functional',
    coding: 'BG',
    value: 33,
    time: Date.now(),
  }, (err, result) => {
    console.log(err, result);
  });
  energy.findOneAndUpdate({
    collector: device._id,
    meter: 'meter',
    functional: 'functional',
    coding: 'BG',
    value: 38,
    time: Date.now(),
  }, (err, result) => {
    console.log(result);
  });
  energy.getAll((err, list) => {
    console.log(list);
  });
  */
});


/*
collector.online({ building, gateway, address }, (error, result) => {
  console.log(error, result);
});
*/


/*
collector.offline({ building, gateway }, (error, result) => {
  console.log(error, result);
});
*/

/*
collector.add({ building, gateway, key }, (error, result) => {
  console.log(error, result);
});
*/

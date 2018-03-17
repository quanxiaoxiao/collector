const { Collector } = require('../models');

const add = ({ building, gateway, key }, cb) => {
  const collector = new Collector({
    building,
    gateway,
    key,
  });
  collector.save(cb);
};

const find = ({ building, gateway }, cb) => {
  Collector.findOne({ building, gateway }, cb);
};

const online = ({ building, gateway, address }, cb) => {
  Collector.findOneAndUpdate({ building, gateway }, {
    lastLogin: Date.now(),
    address,
    online: true,
  }, cb);
};

const offline = ({ building, gateway }, cb) => {
  Collector.findOneAndUpdate({ building, gateway }, {
    online: false,
  }, cb);
};

module.exports = {
  add,
  find,
  online,
  offline,
};

const { Energy } = require('../models');

const add = ({
  collector,
  time,
  meter,
  functional,
  coding,
  value,
}, cb) => {
  const energ = new Energy({
    collector,
    time,
    meter,
    functional,
    coding,
    value,
    uploadTime: Date.now(),
  });
  energ.save(cb);
};

const getAll = (cb) => {
  Energy.find({}).sort({ time: 'desc' }).exec(cb);
};

const queryByCollector = (collector, cb) => {
  Energy.find({ collector }).sort({ time: 'desc' }).exec(cb);
};

const findOneAndUpdate = ({
  collector,
  meter,
  functional,
  coding,
  value,
  time,
}, cb) => {
  const query = {
    collector,
    meter,
    functional,
    coding,
    value,
  };
  Energy.findOneAndUpdate(
    query, {
      $set: {
        ...query,
        time,
      },
    },
    { upsert: true, new: true, runValidators: true },
    cb,
  );
};

module.exports = {
  add,
  queryByCollector,
  getAll,
  findOneAndUpdate,
};

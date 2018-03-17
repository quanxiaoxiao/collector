const mongoose = require('mongoose');
const config = require('../config');

mongoose.connect(config.db, (error) => {
  if (error) {
    console.error(`connect to ${config.db} error: ${error.message}`);
    process.exit(1);
  }
});

const collectorSchema = require('./collector');
const energySchema = require('./energy');

exports.Collector = mongoose.model('collector', collectorSchema);
exports.Energy = mongoose.model('energy', energySchema);

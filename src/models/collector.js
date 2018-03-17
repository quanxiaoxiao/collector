const { Schema } = require('mongoose');

const collectorSchema = new Schema({
  building: {
    type: String,
    required: true,
  },
  gateway: {
    type: String,
    required: true,
  },
  lastLogin: {
    type: Date,
  },
  online: {
    type: Boolean,
    default: false,
  },
  key: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  addTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = collectorSchema;

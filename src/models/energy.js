const { Schema } = require('mongoose');

const energySchema = new Schema({
  collector: {
    type: Schema.Types.ObjectId,
    ref: 'collector',
    required: true,
  },
  uploadTime: {
    type: Date,
    default: Date.now,
  },
  time: {
    type: Date,
    required: true,
  },
  meter: {
    type: String,
    required: true,
  },
  functional: {
    type: String,
    required: true,
  },
  coding: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
});

module.exports = energySchema;

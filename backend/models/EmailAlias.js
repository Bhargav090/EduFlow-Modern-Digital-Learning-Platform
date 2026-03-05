const mongoose = require('mongoose');

const emailAliasSchema = new mongoose.Schema({
  personalEmail: {
    type: String,
    required: true,
    unique: true
  },
  eduEmail: {
    type: String,
    required: true
  },
  collegeDomain: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailAlias', emailAliasSchema);

const mongoose = require('mongoose');
const { EMAIL } = require('../config/Constants');

const emailTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true 
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true 
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: EMAIL.VERIFICATION_EXPIRATION_SECONDS,
    index: true 
  },
  verified: {
    type: Boolean,
    default: false,
    index: true 
  }
}, { 
  strict: true,
  timestamps: true 
});

emailTokenSchema.index({ userId: 1, verified: 1 });

module.exports = mongoose.model('EmailToken', emailTokenSchema);
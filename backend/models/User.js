const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: 'text' 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true 
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false 
  },
  role: {
    type: String,
    required: true,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
    index: true 
  },
  securityQuestion: {
    type: String,
    required: true
  },
  securityAnswer: {
    type: String,
    required: true,
    select: false 
  },
  emailVerified: {
    type: Boolean,
    default: false,
    index: true 
  },
  lastLogin: {
    type: Date,
  }
}, { 
  strict: true,
  timestamps: true 
});

userSchema.index({ email: 1, emailVerified: 1 });
userSchema.index({ role: 1, emailVerified: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 8);
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
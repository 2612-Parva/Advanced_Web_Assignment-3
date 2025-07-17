// models/Doctor.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const doctorSchema = new Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    validate: {
      validator: async function (userId) {
        const user = await mongoose.model('User').findById(userId);
        return user && user.role === 'doctor';
      },
      message: 'Invalid doctor ID or user is not a doctor'
    }
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (value) {
          return value.length === 2 &&
            value[0] >= -180 && value[0] <= 180 &&
            value[1] >= -90 && value[1] <= 90;
        },
        message: 'Coordinates must be [longitude, latitude] within valid ranges'
      }
    }
  },
  education: {
    type: String,
    trim: true
  },
  specialization: {
    type: [String],
    enum: [
      'Dermatologist',
      'Cardiologist',
      'Oncologist',
      'Family Medicine',
      'Anesthesiology',
      'Neurologist',
      'Psychiatrist',
      'Radiologist',
      'Gynecologist',
      'Orthopedic Surgeon',
      'Pediatrician',
      'Urologist',
      'ENT Specialist',
      'Gastroenterologist',
      'General Practitioner'
    ],
    required: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  profilePicture: {
    data: Buffer,
    contentType: String
  }

  // Uncomment when admin approval is used
  // isApproved: {
  //   type: Boolean,
  //   default: false
  // }

}, { strict: true, timestamps: true });

// Enable geospatial queries
doctorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Doctor', doctorSchema);

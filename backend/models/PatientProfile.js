const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  dob: {
    type: Date,
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    default: null
  },
  allergies: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    default: ''
  },
  medicalNote: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('PatientProfile', patientProfileSchema);

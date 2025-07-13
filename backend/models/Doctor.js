const mongoose = require('mongoose');
const { Schema } = mongoose;

const doctorSchema = new Schema({
  doctorId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
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
  availability: {
    type: [
      {
        date: {
          type: Date,
          required: true,
          validate: {
            validator: function (value) {
              const now = new Date();
              const monthAhead = new Date();
              monthAhead.setMonth(now.getMonth() + 1);
              return value >= now && value <= monthAhead;
            },
            message: 'Availability must be within the next month'
          }
        },
        slots: [
          {
            from: {
              type: String,
              required: true,
              validate: {
                validator: function (value) {
                  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
                },
                message: 'From time must be in HH:mm format'
              }
            },
            to: {
              type: String,
              required: true,
              validate: {
                validator: function (value) {
                  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
                },
                message: 'To time must be in HH:mm format'
              }
            }
          }
        ]
      }
    ],
    default: []
  },
  profilePicture: {
    data: Buffer,
    contentType: String
  }

  // Uncomment this later when admin approval is added
  // isApproved: {
  //   type: Boolean,
  //   default: false
  // }

}, { strict: true, timestamps: true });

doctorSchema.index({ location: '2dsphere' });

doctorSchema.pre('save', function (next) {
  if (!this.doctorId) {
    this.doctorId = this._id.toString();
  }
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);

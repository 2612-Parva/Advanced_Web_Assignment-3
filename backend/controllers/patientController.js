const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const { responseBody } = require('../config/responseBody');

const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select('fullName email role emailVerified createdAt');
    if (!user || user.role !== 'patient') {
      return res.status(404).json(responseBody(404, 'Patient user not found', null));
    }

    const profile = await PatientProfile.findOne({ userId });

    return res.status(200).json(
      responseBody(200, 'Patient profile fetched', {
        user,
        profile
      })
    );
  } catch (err) {
    console.error('Get Patient Profile error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server error', null));
  }
};

const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const {
      mobile,
      dob,
      gender,
      bloodType,
      allergies,
      emergencyContact,
      medicalNote
    } = req.body;

    const errors = [];

    const genderEnum = PatientProfile.schema.path('gender').enumValues;
    const bloodTypeEnum = PatientProfile.schema.path('bloodType').enumValues;

    if (gender && !genderEnum.includes(gender)) {
      errors.push(`Gender must be one of: ${genderEnum.join(', ')}`);
    }

    if (bloodType && !bloodTypeEnum.includes(bloodType)) {
      errors.push(`Blood type must be one of: ${bloodTypeEnum.join(', ')}`);
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
      errors.push('Mobile number must be a 10-digit number');
    }

    if (dob && isNaN(Date.parse(dob))) {
      errors.push('Date of birth must be a valid date');
    }

    if (emergencyContact && !/^\d{10}$/.test(emergencyContact)) {
      errors.push('Emergency contact must be a 10-digit number');
    }

    if (errors.length) {
      return res.status(400).json(responseBody(400, 'Validation error', { errors }));
    }

    let profile = await PatientProfile.findOne({ userId });

    if (profile) {
      profile.mobile = mobile;
      profile.dob = dob;
      profile.gender = gender;
      profile.bloodType = bloodType;
      profile.allergies = allergies;
      profile.emergencyContact = emergencyContact;
      profile.medicalNote = medicalNote;

      await profile.save();

      return res.status(200).json(
        responseBody(200, 'Profile updated successfully', profile)
      );
    }

    profile = new PatientProfile({
      userId,
      mobile,
      dob,
      gender,
      bloodType,
      allergies,
      emergencyContact,
      medicalNote
    });

    await profile.save();

    return res.status(201).json(
      responseBody(201, 'Profile created successfully', profile)
    );
  } catch (err) {
    console.error('Update Patient Profile error:', err);
    return res.status(500).json(responseBody(500, 'Server error', null));
  }
};


module.exports = {
  getPatientProfile,
  updatePatientProfile
};

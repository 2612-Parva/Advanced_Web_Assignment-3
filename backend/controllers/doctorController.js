const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { responseBody } = require('../config/responseBody');

// Get doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'doctor') {
      return res.status(403).json(responseBody(403, 'Forbidden: Only doctors can access their profile', null));
    }

    const doctor = await Doctor.findOne({ userId: user.userId });
    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor profile not found', null));
    }

    const currentUser = await User.findById(user.userId);
    const profile = {
      ...doctor.toObject(),
      fullName: currentUser.fullName,
      email: currentUser.email
    };

    return res.status(200).json(responseBody(200, 'Doctor profile retrieved successfully', profile));
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to fetch doctor profile', null));
  }
};

// Update basic profile
const updateBasicDoctorProfile = async (req, res) => {
  try {
    const user = req.user;
    const updates = { ...req.body };

    if (!user || user.role !== 'doctor') {
      return res.status(403).json(responseBody(403, 'Forbidden: Only doctors can update their profile', null));
    }

    delete updates.userId;
    delete updates.email;
    delete updates.doctorId;
    delete updates.status;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: user.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor profile not found', null));
    }

    return res.status(200).json(responseBody(200, 'Doctor profile updated successfully', doctor));
  } catch (error) {
    console.error('Error updating basic profile:', error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to update profile', null));
  }
};

// Update availability
const updateAvailability = async (req, res) => {
  try {
    const user = req.user;
    const { availability } = req.body;

    if (!user || user.role !== 'doctor') {
      return res.status(403).json(responseBody(403, 'Forbidden: Only doctors can set availability', null));
    }

    const doctor = await Doctor.findOne({ userId: user.userId });
    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor profile not found', null));
    }

    doctor.availability = availability;
    await doctor.save();

    return res.status(200).json(responseBody(200, 'Availability updated successfully', doctor.availability));
  } catch (error) {
    console.error('Error updating availability:', error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to update availability', null));
  }
};

// Update address and geolocation
const updateDoctorAddress = async (req, res) => {
  try {
    const user = req.user;
    const { address, coordinates } = req.body;

    if (!user || user.role !== 'doctor') {
      return res.status(403).json(responseBody(403, 'Forbidden: Only doctors can update address', null));
    }

    if (!address || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json(responseBody(400, 'Validation error: address and [lng, lat] coordinates are required', null));
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userId: user.userId },
      {
        address,
        location: {
          type: 'Point',
          coordinates
        }
      },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor profile not found', null));
    }

    return res.status(200).json(responseBody(200, 'Address updated successfully', {
      address: doctor.address,
      location: doctor.location
    }));
  } catch (error) {
    console.error('Error updating address:', error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to update address', null));
  }
};

// Get availability
const getAvailability = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== 'doctor') {
      return res.status(403).json(responseBody(403, 'Forbidden: Only doctors can view availability', null));
    }

    const doctor = await Doctor.findOne({ userId: user.userId });
    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor profile not found', null));
    }

    return res.status(200).json(responseBody(200, 'Availability retrieved successfully', doctor.availability));
  } catch (error) {
    console.error('Error getting availability:', error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to get availability', null));
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'doctor') {
      return res.status(403).json(responseBody(403, 'Forbidden: Only doctors can upload profile picture', null));
    }

    if (!req.file) {
      return res.status(400).json(responseBody(400, 'No image file uploaded', null));
    }

    const doctor = await Doctor.findOne({ userId: user.userId });
    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor profile not found', null));
    }

    doctor.profilePicture = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };

    await doctor.save();
    return res.status(200).json(responseBody(200, 'Profile picture updated successfully', null));
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to upload profile picture', null));
  }
};

// Public profile for patients
const getPublicDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findOne({ doctorId }).populate('userId', 'fullName');
    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor not found', null));
    }

    const publicProfile = {
      fullName: doctor.fullName,
      specialization: doctor.specialization,
      bio: doctor.bio,
      location: doctor.location,
      education: doctor.education,
      availability: doctor.availability
    };

    return res.status(200).json(responseBody(200, 'Doctor profile retrieved', publicProfile));
  } catch (error) {
    console.error('Error fetching public doctor profile:', error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to retrieve doctor profile', null));
  }
};

// Filtered list of doctors (by area, specialization)
const listDoctors = async (req, res) => {
  try {
    const { specialization, lng, lat, radius = 5000 } = req.query;
    const filter = {};

    if (specialization) filter.specialization = specialization;

    if (lng && lat) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    const doctors = await Doctor.find(filter).populate('userId', 'fullName');
    return res.status(200).json(responseBody(200, 'Doctors retrieved successfully', doctors));
  } catch (error) {
    console.error('Error retrieving doctors:', error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to retrieve doctors', null));
  }
};

module.exports = {
  getDoctorProfile,
  updateBasicDoctorProfile,
  updateAvailability,
  updateDoctorAddress,
  getAvailability,
  uploadProfilePicture,
  getPublicDoctorProfile,
  listDoctors
};

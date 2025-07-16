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

    const doctor = await Doctor.findOne({ userId: user.userId }).populate('doctorId', 'fullName email');
    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor profile not found', null));
    }

    

    return res.status(200).json(responseBody(200, 'Doctor profile retrieved successfully', doctor));
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
    delete updates.location; 
    delete updates.profilePicture; 

    const doctor = await Doctor.findOne({ userId: user.userId });
    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor profile not found', null));
    }

    Object.assign(doctor, updates);
    await doctor.save();

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

    if (!availability || typeof availability !== 'object') {
      return res.status(400).json(responseBody(400, 'Invalid availability data', null));
    }

    const doctor = await Doctor.findOne({ userId: user.userId });
    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor profile not found', null));
    }

    const currentUser = await User.findById(user.userId);
    if (!doctor.email) doctor.email = currentUser.email;
    if (!doctor.fullName) doctor.fullName = currentUser.fullName;
    if (!doctor.doctorId) doctor.doctorId = doctor._id.toString();

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

    // Validate coordinate values
    const [lng, lat] = coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number' || 
        lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return res.status(400).json(responseBody(400, 'Invalid coordinates provided', null));
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userId: user.userId },
      {
        address,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
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

    // Add file validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json(responseBody(400, 'Invalid file type. Only JPEG, PNG allowed', null));
    }

    if (req.file.size > maxSize) {
      return res.status(400).json(responseBody(400, 'File too large. Maximum size is 5MB', null));
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
      fullName: doctor.userId.fullName, 
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
    const { specialization, lng, lat, radius = 5000, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (specialization) filter.specialization = specialization;

    if (lng && lat) {
      const longitude = parseFloat(lng);
      const latitude = parseFloat(lat);
      const searchRadius = parseInt(radius);

      // Validate coordinates
      if (isNaN(longitude) || isNaN(latitude) || longitude < -180 || longitude > 180 || 
          latitude < -90 || latitude > 90) {
        return res.status(400).json(responseBody(400, 'Invalid coordinates provided', null));
      }

      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: searchRadius
        }
      };
    }

    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const doctors = await Doctor.find(filter)
      .populate('userId', 'fullName')
      .select('-profilePicture') 
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Doctor.countDocuments(filter);

    return res.status(200).json(responseBody(200, 'Doctors retrieved successfully', {
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }));
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
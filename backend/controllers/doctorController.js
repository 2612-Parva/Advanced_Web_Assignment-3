const Doctor = require('../models/Doctor');
const User = require('../models/User');
const DoctorAvailability = require('../models/DoctorAvailability');
const DoctorCredential = require('../models/DoctorCredential');
const { responseBody } = require('../config/responseBody');
const mongoose = require('mongoose');

// Validation helpers
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateDoctorProfile = (data) => {
  const errors = [];
  const allowedSpecializations = [
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
  ];

  if (data.fullName && (typeof data.fullName !== 'string' || data.fullName.trim().length === 0 || data.fullName.length > 100)) {
    errors.push('fullName must be a string between 1 and 100 characters');
  }
  if (data.dob && !(data.dob instanceof Date && !isNaN(data.dob))) {
    errors.push('dob must be a valid ISO date');
  }
  if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
    errors.push('gender must be male, female, or other');
  }
  if (data.phone && (typeof data.phone !== 'string' || data.phone.length > 20)) {
    errors.push('phone must be a string up to 20 characters');
  }
  if (data.address && (typeof data.address !== 'string' || data.address.trim().length === 0 || data.address.length > 500)) {
    errors.push('address must be a string between 1 and 500 characters');
  }
  if (data.education && (typeof data.education !== 'string' || data.education.length > 1000)) {
    errors.push('education must be a string up to 1000 characters');
  }
  if (data.specialization) {
    if (!Array.isArray(data.specialization) || data.specialization.length === 0) {
      errors.push('specialization must be a non-empty array');
    } else if (!data.specialization.every(s => allowedSpecializations.includes(s))) {
      errors.push('specialization contains invalid values');
    }
  }
  if (data.bio && (typeof data.bio !== 'string' || data.bio.length > 2000)) {
    errors.push('bio must be a string up to 2000 characters');
  }
  return errors;
};

const validateAvailabilitySlot = (slot) => {
  const errors = [];
  if (!(slot.start instanceof Date && !isNaN(slot.start))) {
    errors.push('start must be a valid ISO date');
  }
  if (!(slot.end instanceof Date && !isNaN(slot.end))) {
    errors.push('end must be a valid ISO date');
  }
  if (slot.start && slot.end && slot.start >= slot.end) {
    errors.push('end must be after start');
  }
  if (slot.title && (typeof slot.title !== 'string' || slot.title.length > 100)) {
    errors.push('title must be a string up to 100 characters');
  }
  if (slot.location && (typeof slot.location !== 'string' || slot.location.length > 500)) {
    errors.push('location must be a string up to 500 characters');
  }
  if (slot.description && (typeof slot.description !== 'string' || slot.description.length > 1000)) {
    errors.push('description must be a string up to 1000 characters');
  }
  return errors;
};

const validateAddress = (data) => {
  const errors = [];
  if (typeof data.address !== 'string' || data.address.trim().length === 0 || data.address.length > 500) {
    errors.push('address must be a string between 1 and 500 characters');
  }
  if (!Array.isArray(data.coordinates) || data.coordinates.length !== 2) {
    errors.push('coordinates must be an array of [longitude, latitude]');
  } else {
    const [lng, lat] = data.coordinates;
    if (typeof lng !== 'number' || lng < -180 || lng > 180) {
      errors.push('longitude must be a number between -180 and 180');
    }
    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      errors.push('latitude must be a number between -90 and 90');
    }
  }
  return errors;
};

const validateCredential = (data) => {
  const errors = [];
  if (typeof data.documentType !== 'string' || data.documentType.trim().length === 0 || data.documentType.length > 100) {
    errors.push('documentType must be a string between 1 and 100 characters');
  }
  if (typeof data.href !== 'string' || data.href.trim().length === 0 || data.href.length > 1000 || !/^(https?:\/\/)/.test(data.href)) {
    errors.push('href must be a valid URL up to 1000 characters');
  }
  return errors;
};

const validateApproveReject = (data, isRejection) => {
  const errors = [];
  if (!isValidObjectId(data.adminId)) {
    errors.push('adminId must be a valid ObjectId');
  }
  if (isRejection && (typeof data.reason !== 'string' || data.reason.trim().length === 0 || data.reason.length > 1000)) {
    errors.push('reason must be a string between 1 and 1000 characters for rejection');
  }
  return errors;
};

// Get doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
      return res.status(403).json(
        responseBody(403, 'Forbidden: Only doctors or admins can access doctor profiles', null)
      );
    }

    const queryUserId = user.role === 'admin' && req.query.doctorId ? req.query.doctorId : user.userId;
    if (user.role === 'admin' && req.query.doctorId && !isValidObjectId(req.query.doctorId)) {
      return res.status(400).json(responseBody(400, 'Invalid doctorId', null));
    }

    const doctor = await Doctor.findOne({ doctorId: queryUserId }).populate('doctorId', 'fullName email');

    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor profile not found', null));
    }

    return res.status(200).json(responseBody(200, 'Doctor profile retrieved successfully', doctor));
  } catch (error) {
    console.error(`Error fetching doctor profile for user ${req.user?.userId}:`, error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to fetch doctor profile', null));
  }
};

// Update basic profile
const updateBasicDoctorProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
      return res.status(403).json(responseBody(403, 'Forbidden: Only doctors or admins can update profile', null));
    }

    const queryUserId = user.role === 'admin' && req.query.doctorId ? req.query.doctorId : user.userId;
    if (user.role === 'admin' && req.query.doctorId && !isValidObjectId(req.query.doctorId)) {
      return res.status(400).json(responseBody(400, 'Invalid doctorId', null));
    }

    const updates = { ...req.body };
    const errors = validateDoctorProfile(updates);
    if (errors.length > 0) {
      return res.status(400).json(responseBody(400, 'Validation error', errors));
    }

    const doctor = await Doctor.findOne({ doctorId: queryUserId });
    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor profile not found', null));
    }

    const allowedFields = [
      'fullName',
      'dob',
      'gender',
      'phone',
      'address',
      'education',
      'specialization',
      'bio'
    ];
    for (let key in updates) {
      if (allowedFields.includes(key)) {
        doctor[key] = updates[key];
      }
    }

    await doctor.save();

    return res.status(200).json(responseBody(200, 'Doctor profile updated successfully', doctor));
  } catch (error) {
    console.error(`Error updating doctor profile for user ${req.user?.userId}:`, error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to update profile', null));
  }
};

// Update availability
const updateAvailability = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'doctor') {
      return res.status(403).json(responseBody(403, 'Forbidden: Only doctors can update availability', null));
    }

    const { slots } = req.body;
    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json(responseBody(400, 'Invalid input: Provide a non-empty array of availability slots', null));
    }

    const errors = [];
    slots.forEach((slot, index) => {
      const slotErrors = validateAvailabilitySlot(slot);
      if (slotErrors.length > 0) {
        errors.push(`Slot ${index}: ${slotErrors.join(', ')}`);
      }
    });
    if (errors.length > 0) {
      return res.status(400).json(responseBody(400, 'Validation error', errors));
    }

    await DoctorAvailability.deleteMany({ doctorId: user.userId });

    const entries = slots.map(slot => ({
      doctorId: user.userId,
      title: (slot.title || 'Available').trim(),
      start: new Date(slot.start),
      end: new Date(slot.end),
      location: (slot.location || '').trim(),
      description: (slot.description || '').trim()
    }));

    await DoctorAvailability.insertMany(entries);

    return res.status(200).json(responseBody(200, 'Availability updated successfully', entries));
  } catch (error) {
    console.error(`Error updating availability for user ${req.user?.userId}:`, error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to update availability', null));
  }
};

// Update address and geolocation
const updateDoctorAddress = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'doctor') {
      return res.status(403).json(responseBody(403, 'Forbidden: Only doctors can update address', null));
    }

    const errors = validateAddress(req.body);
    if (errors.length > 0) {
      return res.status(400).json(responseBody(400, 'Validation error', errors));
    }

    const { address, coordinates } = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { doctorId: user.userId },
      {
        address: address.trim(),
        location: {
          type: 'Point',
          coordinates: [coordinates[0], coordinates[1]]
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
    console.error(`Error updating address for user ${req.user?.userId}:`, error);
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

    const availability = await DoctorAvailability.find({ doctorId: user.userId }).sort({ start: 1 });

    return res.status(200).json(responseBody(200, 'Availability retrieved successfully', availability));
  } catch (error) {
    console.error(`Error retrieving availability for user ${req.user?.userId}:`, error);
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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json(responseBody(400, 'Invalid file type. Only JPEG, PNG allowed', null));
    }

    if (req.file.size > maxSize) {
      return res.status(400).json(responseBody(400, 'File too large. Maximum size is 5MB', null));
    }

    const doctor = await Doctor.findOne({ doctorId: user.userId });
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
    console.error(`Error uploading profile picture for user ${req.user?.userId}:`, error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to upload profile picture', null));
  }
};

// Public profile for patients
const getPublicDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!isValidObjectId(doctorId)) {
      return res.status(400).json(responseBody(400, 'Invalid doctorId', null));
    }

    const doctor = await Doctor.findOne({ doctorId }).populate('doctorId', 'fullName');
    if (!doctor) {
      return res.status(404).json(responseBody(404, 'Doctor not found', null));
    }

    const availability = await DoctorAvailability.find({ doctorId }).sort({ start: 1 });

    const publicProfile = {
      fullName: doctor.doctorId.fullName,
      specialization: doctor.specialization,
      bio: doctor.bio,
      location: doctor.location,
      education: doctor.education,
      availability
    };

    return res.status(200).json(responseBody(200, 'Doctor profile retrieved', publicProfile));
  } catch (error) {
    console.error(`Error fetching public doctor profile for doctorId ${req.params.doctorId}:`, error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to retrieve doctor profile', null));
  }
};

// Filtered list of doctors (by area, specialization)
const listDoctors = async (req, res) => {
  try {
    const { specialization, lng, lat, radius = '5000', page = '1', limit = '10' } = req.query;
    const allowedSpecializations = [
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
    ];

    const errors = [];
    if (specialization && !allowedSpecializations.includes(specialization)) {
      errors.push('specialization is invalid');
    }
    if ((lng && !lat) || (!lng && lat)) {
      errors.push('Both lng and lat must be provided together');
    }
    if (lng && lat) {
      const longitude = parseFloat(lng);
      const latitude = parseFloat(lat);
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        errors.push('lng must be a number between -180 and 180');
      }
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        errors.push('lat must be a number between -90 and 90');
      }
    }
    const radiusNum = parseInt(radius);
    if (isNaN(radiusNum) || radiusNum <= 0 || radiusNum > 100000) {
      errors.push('radius must be a positive number up to 100000');
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('page must be a positive integer');
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('limit must be an integer between 1 and 100');
    }
    if (errors.length > 0) {
      return res.status(400).json(responseBody(400, 'Validation error', errors));
    }

    const filter = {};
    if (specialization) filter.specialization = specialization;

    if (lng && lat) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusNum
        }
      };
    }

    const skip = (pageNum - 1) * limitNum;
    const doctors = await Doctor.find(filter)
      .populate('doctorId', 'fullName')
      .select('fullName specialization bio location education')
      .skip(skip)
      .limit(limitNum);

    const total = await Doctor.countDocuments(filter);

    return res.status(200).json(responseBody(200, 'Doctors retrieved successfully', {
      doctors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }));
  } catch (error) {
    console.error('Error retrieving doctors:', error);
    return res.status(500).json(responseBody(500, 'Internal Server Error: Unable to retrieve doctors', null));
  }
};

// Submit doctor credential
const submitDoctorCredential = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { user } = req;

    if (!isValidObjectId(doctorId)) {
      return res.status(400).json(responseBody(400, 'Invalid doctorId', null));
    }

    if (!user || user.userId !== doctorId || user.role !== 'doctor') {
      return res.status(403).json(
        responseBody(403, 'Not authorized to submit credentials for this user', {})
      );
    }

    const errors = validateCredential(req.body);
    if (errors.length > 0) {
      return res.status(400).json(responseBody(400, 'Validation error', errors));
    }

    const { documentType, href } = req.body;

    const existing = await DoctorCredential.findOne({
      doctorId,
      documentType: documentType.trim(),
      status: 'Pending'
    });

    if (existing) {
      return res.status(409).json(
        responseBody(409, 'Existing credential already pending review', {})
      );
    }

    const credential = await DoctorCredential.create({
      doctorId,
      documentType: documentType.trim(),
      href: href.trim()
    });

    return res.status(201).json(
      responseBody(201, 'Credentials submitted; pending admin approval', {
        credentialId: credential._id,
        doctorId: credential.doctorId,
        documentType: credential.documentType,
        submittedAt: credential.submittedAt,
        status: credential.status
      })
    );
  } catch (error) {
    console.error(`Error submitting credentials for doctorId ${req.params.doctorId}:`, error);
    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to submit credentials', {})
    );
  }
};

// Get doctor credentials
const getDoctorCredentials = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { user } = req;

    if (!isValidObjectId(doctorId)) {
      return res.status(400).json(responseBody(400, 'Invalid doctorId', null));
    }

    if (!user || user.role !== 'doctor' || user.userId !== doctorId) {
      return res.status(403).json(
        responseBody(403, 'Not authorized to view these credentials', {})
      );
    }

    const credentials = await DoctorCredential.find({ doctorId }).sort({ submittedAt: -1 });

    return res.status(200).json(
      responseBody(200, 'Credential submissions retrieved', {
        credentials: credentials.map(c => ({
          credentialId: c._id,
          documentType: c.documentType,
          href: c.href,
          submittedAt: c.submittedAt,
          status: c.status,
          reviewedAt: c.reviewedAt || null,
          reason: c.reason || null
        }))
      })
    );
  } catch (error) {
    console.error(`Error fetching credentials for doctorId ${req.params.doctorId}:`, error);
    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to fetch credentials', {})
    );
  }
};

// Approve doctor credential
const approveDoctorCredential = async (req, res) => {
  try {
    const { doctorId, credentialId } = req.params;
    const { user } = req;

    if (!isValidObjectId(doctorId) || !isValidObjectId(credentialId)) {
      return res.status(400).json(responseBody(400, 'Invalid doctorId or credentialId', null));
    }

    if (!user || user.role !== 'admin') {
      return res.status(403).json(
        responseBody(403, 'Admin role required to approve credentials', {})
      );
    }

    const errors = validateApproveReject(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json(responseBody(400, 'Validation Supreme error', errors));
    }

    const credential = await DoctorCredential.findOne({ _id: credentialId, doctorId });

    if (!credential) {
      return res.status(404).json(
        responseBody(404, 'Credential submission not found', {})
      );
    }

    if (credential.status !== 'Pending') {
      return res.status(409).json(
        responseBody(409, 'Credentials have already been reviewed', {})
      );
    }

    credential.status = 'Approved';
    credential.adminId = req.body.adminId;
    credential.reviewedAt = new Date();

    await credential.save();

    return res.status(200).json(
      responseBody(200, 'Credentials approved', {
        credentialId: credential._id,
        doctorId: credential.doctorId,
        adminId: credential.adminId,
        status: credential.status,
        reviewedAt: credential.reviewedAt
      })
    );
  } catch (error) {
    console.error(`Error approving credential ${req.params.credentialId} for doctorId ${req.params.doctorId}:`, error);
    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to approve credentials', {})
    );
  }
};

// Reject doctor credential
const rejectDoctorCredential = async (req, res) => {
  try {
    const { doctorId, credentialId } = req.params;
    const { user } = req;

    if (!isValidObjectId(doctorId) || !isValidObjectId(credentialId)) {
      return res.status(400).json(responseBody(400, 'Invalid doctorId or credentialId', null));
    }

    if (!user || user.role !== 'admin') {
      return res.status(403).json(
        responseBody(403, 'Admin role required to reject credentials', {})
      );
    }

    const errors = validateApproveReject(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json(responseBody(400, 'Validation error', errors));
    }

    const credential = await DoctorCredential.findOne({ _id: credentialId, doctorId });

    if (!credential) {
      return res.status(404).json(
        responseBody(404, 'Credential submission not found', {})
      );
    }

    if (credential.status !== 'Pending') {
      return res.status(409).json(
        responseBody(409, 'Credentials have already been reviewed', {})
      );
    }

    credential.status = 'Rejected';
    credential.adminId = req.body.adminId;
    credential.reason = req.body.reason.trim();
    credential.reviewedAt = new Date();

    await credential.save();

    return res.status(200).json(
      responseBody(200, 'Credentials rejected', {
        credentialId: credential._id,
        doctorId: credential.doctorId,
        adminId: credential.adminId,
        status: credential.status,
        reviewedAt: credential.reviewedAt,
        reason: credential.reason
      })
    );
  } catch (error) {
    console.error(`Error rejecting credential ${req.params.credentialId} for doctorId ${req.params.doctorId}:`, error);
    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to reject credentials', {})
    );
  }
};

// Get doctor credential by ID
const getDoctorCredentialById = async (req, res) => {
  try {
    const { doctorId, credentialId } = req.params;
    const { user } = req;

    if (!isValidObjectId(doctorId) || !isValidObjectId(credentialId)) {
      return res.status(400).json(responseBody(400, 'Invalid doctorId or credentialId', null));
    }

    if (!user || (user.role !== 'admin' && user.userId !== doctorId)) {
      return res.status(403).json(
        responseBody(403, 'Not authorized to view this credential', {})
      );
    }

    const credential = await DoctorCredential.findOne({ _id: credentialId, doctorId });

    if (!credential) {
      return res.status(404).json(
        responseBody(404, 'Credential submission not found', {})
      );
    }

    return res.status(200).json(
      responseBody(200, 'Credential retrieved', {
        credentialId: credential._id,
        doctorId: credential.doctorId,
        documentType: credential.documentType,
        href: credential.href,
        status: credential.status,
        submittedAt: credential.submittedAt,
        reviewedAt: credential.reviewedAt || null,
        reason: credential.reason || null,
        adminId: credential.adminId || null
      })
    );
  } catch (error) {
    console.error(`Error retrieving credential ${req.params.credentialId} for doctorId ${req.params.doctorId}:`, error);
    return res.status(500).json(
      responseBody(500, 'Internal Server Error: Unable to retrieve credential', {})
    );
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
  listDoctors,
  submitDoctorCredential,
  getDoctorCredentials,
  approveDoctorCredential,
  rejectDoctorCredential,
  getDoctorCredentialById
};
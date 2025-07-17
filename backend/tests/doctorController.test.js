const {
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
} = require('../controllers/doctorController');

const Doctor = require('../models/Doctor');
const User = require('../models/User');
const DoctorAvailability = require('../models/DoctorAvailability');
const DoctorCredential = require('../models/DoctorCredential');
const { responseBody } = require('../config/responseBody');

jest.mock('../models/Doctor');
jest.mock('../models/User');
jest.mock('../models/DoctorAvailability');
jest.mock('../models/DoctorCredential');

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe('Doctor Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: null,
      file: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getDoctorProfile', () => {
    it('returns 403 if no user or wrong role', async () => {
      req.user = { role: 'patient', userId: 'u1' };
      await getDoctorProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Only doctors or admins can perform this action', null)
      );
    });

    it('returns 400 if admin provides invalid doctorId', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.query = { doctorId: 'invalid' };
      await getDoctorProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Invalid doctorId', null)
      );
    });

    it('returns 404 if doctor profile not found', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      Doctor.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      await getDoctorProfile(req, res);
      expect(Doctor.findOne).toHaveBeenCalledWith({ doctorId: 'doc1' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Doctor profile not found', null)
      );
    });

    it('returns profile on success', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      const fakeDoctor = {
        doctorId: { _id: 'doc1', fullName: 'Dr. Smith', email: 'doctor@test.com' },
        specialization: ['Cardiologist'],
        bio: 'Experienced doctor',
        location: { type: 'Point', coordinates: [0, 0] }
      };
      Doctor.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeDoctor)
      });
      await getDoctorProfile(req, res);
      expect(Doctor.findOne).toHaveBeenCalledWith({ doctorId: 'doc1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Doctor profile retrieved successfully', fakeDoctor)
      );
    });

    it('returns 500 on other errors', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      Doctor.findOne.mockRejectedValue(new Error('oops'));
      await getDoctorProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: oops', null)
      );
    });
  });

  describe('updateBasicDoctorProfile', () => {
    it('returns 403 if no user or wrong role', async () => {
      req.user = { role: 'patient', userId: 'u1' };
      req.body = { bio: 'New bio' };
      await updateBasicDoctorProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Only doctors or admins can perform this action', null)
      );
    });

    it('returns 400 if validation fails', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { specialization: ['InvalidSpecialty'] };
      await updateBasicDoctorProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error', ['specialization contains invalid values'])
      );
    });

    it('creates and updates profile on success', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { bio: 'Updated bio', specialization: ['Cardiologist'] };
      const fakeUser = { _id: 'doc1', role: 'doctor', email: 'doctor@test.com', fullName: 'Dr. Smith' };
      const fakeDoctor = {
        doctorId: 'doc1',
        email: 'doctor@test.com',
        fullName: 'Dr. Smith',
        specialization: ['Cardiologist'],
        bio: 'Updated bio',
        location: { type: 'Point', coordinates: [0, 0] },
        save: jest.fn().mockResolvedValue()
      };
      User.findById.mockResolvedValue(fakeUser);
      Doctor.findOne.mockResolvedValue(null);
      Doctor.mockImplementation(() => fakeDoctor);
      await updateBasicDoctorProfile(req, res);
      expect(Doctor.findOne).toHaveBeenCalledWith({ doctorId: 'doc1' });
      expect(fakeDoctor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Doctor profile updated successfully', fakeDoctor)
      );
    });

    it('returns 400 on Mongoose ValidationError', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { bio: 'Updated bio' };
      const err = new Error('fail');
      err.name = 'ValidationError';
      err.errors = { field: { message: 'bad' } };
      User.findById.mockResolvedValue({ _id: 'doc1', role: 'doctor' });
      Doctor.findOne.mockResolvedValue(null);
      Doctor.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(err)
      }));
      await updateBasicDoctorProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error: bad', null)
      );
    });

    it('returns 500 on other errors', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { bio: 'New bio' };
      Doctor.findOne.mockRejectedValue(new Error('oops'));
      await updateBasicDoctorProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Failed to create doctor profile: oops', null)
      );
    });
  });

  describe('updateAvailability', () => {
    it('returns 403 if no user or wrong role', async () => {
      req.user = { role: 'patient', userId: 'u1' };
      req.body = { slots: [] };
      await updateAvailability(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Only doctors can perform this action', null)
      );
    });

    it('returns 400 if slots is not a non-empty array', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { slots: [] };
      await updateAvailability(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Provide a non-empty array of availability slots', null)
      );
    });

    it('returns 400 if slot validation fails', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { slots: [{ start: 'invalid', end: '2025-01-01T12:00:00Z' }] };
      await updateAvailability(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error', ['Slot 0: start must be a valid ISO date'])
      );
    });

    it('updates availability on success', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      const now = new Date().toISOString();
      req.body = {
        slots: [{ start: now, end: new Date(Date.now() + 3600000).toISOString(), title: 'Consultation' }]
      };
      const fakeAvailability = {
        doctorId: 'doc1',
        start: new Date(now),
        end: new Date(Date.now() + 3600000),
        title: 'Consultation',
        save: jest.fn().mockResolvedValue()
      };
      DoctorAvailability.deleteMany.mockResolvedValue(null);
      DoctorAvailability.insertMany.mockResolvedValue([fakeAvailability]);
      await updateAvailability(req, res);
      expect(DoctorAvailability.deleteMany).toHaveBeenCalledWith({ doctorId: 'doc1' });
      expect(DoctorAvailability.insertMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Availability updated successfully', [fakeAvailability])
      );
    });

    it('returns 400 on Mongoose ValidationError', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = {
        slots: [{ start: new Date().toISOString(), end: new Date(Date.now() + 3600000).toISOString() }]
      };
      const err = new Error('fail');
      err.name = 'ValidationError';
      err.errors = { field: { message: 'bad' } };
      DoctorAvailability.deleteMany.mockResolvedValue(null);
      DoctorAvailability.insertMany.mockRejectedValue(err);
      await updateAvailability(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error: bad', null)
      );
    });

    it('returns 500 on other errors', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = {
        slots: [{ start: new Date().toISOString(), end: new Date(Date.now() + 3600000).toISOString() }]
      };
      DoctorAvailability.deleteMany.mockRejectedValue(new Error('oops'));
      await updateAvailability(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Failed to update availability: oops', null)
      );
    });
  });

  describe('updateDoctorAddress', () => {
    it('returns 403 if no user or wrong role', async () => {
      req.user = { role: 'patient', userId: 'u1' };
      req.body = { address: '123 Main St', coordinates: [0, 0] };
      await updateDoctorAddress(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Only doctors can perform this action', null)
      );
    });

    it('returns 400 if address or coordinates are missing/invalid', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { address: '', coordinates: [200, 95] };
      await updateDoctorAddress(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error', [
          'address must be a non-empty string up to 500 characters',
          'longitude must be a number between -180 and 180',
          'latitude must be a number between -90 and 90'
        ])
      );
    });

    it('returns 404 if doctor profile not found', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { address: '123 Main St', coordinates: [0, 0] };
      Doctor.findOneAndUpdate.mockResolvedValue(null);
      await updateDoctorAddress(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Doctor profile not found', null)
      );
    });

    it('updates address on success', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { address: '123 Main St', coordinates: [0, 0] };
      const fakeDoctor = {
        address: '123 Main St',
        location: { type: 'Point', coordinates: [0, 0] }
      };
      Doctor.findOneAndUpdate.mockResolvedValue(fakeDoctor);
      await updateDoctorAddress(req, res);
      expect(Doctor.findOneAndUpdate).toHaveBeenCalledWith(
        { doctorId: 'doc1' },
        { address: '123 Main St', location: { type: 'Point', coordinates: [0, 0] } },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Address updated successfully', fakeDoctor)
      );
    });

    it('returns 400 on Mongoose ValidationError', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { address: '123 Main St', coordinates: [0, 0] };
      const err = new Error('fail');
      err.name = 'ValidationError';
      err.errors = { field: { message: 'bad' } };
      Doctor.findOneAndUpdate.mockRejectedValue(err);
      await updateDoctorAddress(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error: bad', null)
      );
    });

    it('returns 500 on other errors', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { address: '123 Main St', coordinates: [0, 0] };
      Doctor.findOneAndUpdate.mockRejectedValue(new Error('oops'));
      await updateDoctorAddress(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: oops', null)
      );
    });
  });

  describe('getAvailability', () => {
    it('returns 403 if no user or wrong role', async () => {
      req.user = { role: 'patient', userId: 'u1' };
      await getAvailability(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Only doctors can perform this action', null)
      );
    });

    it('returns availability on success', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      const now = new Date();
      const fakeAvailability = [
        {
          doctorId: 'doc1',
          start: now,
          end: new Date(now.getTime() + 3600000),
          title: 'Consultation'
        }
      ];
      DoctorAvailability.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(fakeAvailability)
      });
      await getAvailability(req, res);
      expect(DoctorAvailability.find).toHaveBeenCalledWith({ doctorId: 'doc1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Availability retrieved successfully', fakeAvailability)
      );
    });

    it('returns 500 on other errors', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      DoctorAvailability.find.mockRejectedValue(new Error('oops'));
      await getAvailability(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: oops', null)
      );
    });
  });

  describe('uploadProfilePicture', () => {
    it('returns 403 if no user or wrong role', async () => {
      req.user = { role: 'patient', userId: 'u1' };
      req.file = { filename: 'test.jpg', path: '/uploads/test.jpg', mimetype: 'image/jpeg', size: 1000 };
      await uploadProfilePicture(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Only doctors can perform this action', null)
      );
    });

    it('returns 400 if no file uploaded', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.file = null;
      await uploadProfilePicture(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'No image file uploaded', null)
      );
    });

    it('returns 400 if file type is invalid', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.file = { filename: 'test.txt', path: '/uploads/test.txt', mimetype: 'text/plain', size: 1000 };
      await uploadProfilePicture(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Invalid file type. Only JPEG, PNG allowed', null)
      );
    });

    it('returns 400 if file size is too large', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.file = { filename: 'test.jpg', path: '/uploads/test.jpg', mimetype: 'image/jpeg', size: 15 * 1024 * 1024 };
      await uploadProfilePicture(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'File too large. Maximum size is 10MB', null)
      );
    });

    it('returns 404 if doctor profile not found', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.file = { filename: 'test.jpg', path: '/uploads/test.jpg', mimetype: 'image/jpeg', size: 1000 };
      Doctor.findOne.mockResolvedValue(null);
      await uploadProfilePicture(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Doctor profile not found', null)
      );
    });

    it('uploads profile picture on success', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.file = { filename: 'test.jpg', path: '/uploads/test.jpg', mimetype: 'image/jpeg', size: 1000 };
      const fakeDoctor = {
        profilePicture: null,
        save: jest.fn().mockResolvedValue()
      };
      Doctor.findOne.mockResolvedValue(fakeDoctor);
      await uploadProfilePicture(req, res);
      expect(fakeDoctor.profilePicture).toEqual({
        filename: 'test.jpg',
        path: '/uploads/test.jpg'
      });
      expect(fakeDoctor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Profile picture updated successfully', null)
      );
    });

    it('returns 400 on Mongoose ValidationError', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.file = { filename: 'test.jpg', path: '/uploads/test.jpg', mimetype: 'image/jpeg', size: 1000 };
      const err = new Error('fail');
      err.name = 'ValidationError';
      err.errors = { field: { message: 'bad' } };
      Doctor.findOne.mockResolvedValue({
        save: jest.fn().mockRejectedValue(err)
      });
      await uploadProfilePicture(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error: bad', null)
      );
    });

    it('returns 500 on other errors', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.file = { filename: 'test.jpg', path: '/uploads/test.jpg', mimetype: 'image/jpeg', size: 1000 };
      Doctor.findOne.mockRejectedValue(new Error('oops'));
      await uploadProfilePicture(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Failed to update profile picture: oops', null)
      );
    });
  });

  describe('getPublicDoctorProfile', () => {
    it('returns 400 if doctorId is invalid', async () => {
      req.params = { doctorId: 'invalid' };
      await getPublicDoctorProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Invalid doctorId', null)
      );
    });

    it('returns 404 if doctor not found', async () => {
      req.params = { doctorId: 'doc1' };
      Doctor.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      await getPublicDoctorProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Doctor not found', null)
      );
    });

    it('returns public profile on success', async () => {
      req.params = { doctorId: 'doc1' };
      const fakeDoctor = {
        doctorId: { fullName: 'Dr. Smith' },
        specialization: ['Cardiologist'],
        bio: 'Experienced doctor',
        location: { type: 'Point', coordinates: [0, 0] },
        education: 'MD'
      };
      const fakeAvailability = [{ doctorId: 'doc1', start: new Date(), end: new Date() }];
      Doctor.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeDoctor)
      });
      DoctorAvailability.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(fakeAvailability)
      });
      await getPublicDoctorProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Doctor profile retrieved', {
          fullName: 'Dr. Smith',
          specialization: ['Cardiologist'],
          bio: 'Experienced doctor',
          location: { type: 'Point', coordinates: [0, 0] },
          education: 'MD',
          availability: fakeAvailability
        })
      );
    });

    it('returns 500 on other errors', async () => {
      req.params = { doctorId: 'doc1' };
      Doctor.findOne.mockRejectedValue(new Error('oops'));
      await getPublicDoctorProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: oops', null)
      );
    });
  });

  describe('listDoctors', () => {
    it('returns 400 if coordinates are invalid', async () => {
      req.query = { lng: '200', lat: '95' };
      await listDoctors(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error', [
          'lng must be a number between -180 and 180',
          'lat must be a number between -90 and 90'
        ])
      );
    });

    it('returns 400 if specialization is invalid', async () => {
      req.query = { specialization: 'InvalidSpecialty' };
      await listDoctors(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error', ['specialization is invalid'])
      );
    });

    it('returns doctors list on success', async () => {
      req.query = { specialization: 'Cardiologist', page: '1', limit: '10' };
      const fakeDoctors = [{ doctorId: { fullName: 'Dr. Smith' }, specialization: ['Cardiologist'] }];
      Doctor.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(fakeDoctors)
            })
          })
        })
      });
      Doctor.countDocuments.mockResolvedValue(1);
      await listDoctors(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Doctors retrieved successfully', {
          doctors: fakeDoctors,
          pagination: { page: 1, limit: 10, total: 1, pages: 1 }
        })
      );
    });

    it('returns 500 on other errors', async () => {
      req.query = {};
      Doctor.find.mockRejectedValue(new Error('oops'));
      await listDoctors(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: oops', null)
      );
    });
  });

  describe('submitDoctorCredential', () => {
    it('returns 400 if doctorId is invalid', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'invalid' };
      await submitDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Invalid doctorId', null)
      );
    });

    it('returns 403 if user is not authorized', async () => {
      req.user = { role: 'doctor', userId: 'doc2' };
      req.params = { doctorId: 'doc1' };
      await submitDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Not authorized to access this doctor profile', null)
      );
    });

    it('returns 400 if no file or invalid file', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'doc1' };
      req.file = null;
      await submitDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error', ['No PDF file uploaded'])
      );
    });

    it('submits credential on success', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'doc1' };
      req.file = { filename: 'credential.pdf', mimetype: 'application/pdf', size: 1000 };
      const fakeCredential = {
        _id: 'cred1',
        doctorId: 'doc1',
        fileName: 'credential.pdf',
        submittedAt: new Date(),
        status: 'Pending'
      };
      DoctorCredential.findOneAndUpdate.mockResolvedValue(fakeCredential);
      await submitDoctorCredential(req, res);
      expect(DoctorCredential.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(201, 'Credential submitted; pending admin approval', {
          credentialId: 'cred1',
          doctorId: 'doc1',
          fileName: 'credential.pdf',
          submittedAt: fakeCredential.submittedAt,
          status: 'Pending'
        })
      );
    });

    it('returns 400 on Mongoose ValidationError', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'doc1' };
      req.file = { filename: 'credential.pdf', mimetype: 'application/pdf', size: 1000 };
      const err = new Error('fail');
      err.name = 'ValidationError';
      err.errors = { field: { message: 'bad' } };
      DoctorCredential.findOneAndUpdate.mockRejectedValue(err);
      await submitDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error: bad', null)
      );
    });

    it('returns 500 on other errors', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'doc1' };
      req.file = { filename: 'credential.pdf', mimetype: 'application/pdf', size: 1000 };
      DoctorCredential.findOneAndUpdate.mockRejectedValue(new Error('oops'));
      await submitDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Failed to submit credential: oops', null)
      );
    });
  });

  describe('getDoctorCredentials', () => {
    it('returns 400 if doctorId is invalid', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'invalid' };
      await getDoctorCredentials(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Invalid doctorId', null)
      );
    });

    it('returns 403 if user is not authorized', async () => {
      req.user = { role: 'doctor', userId: 'doc2' };
      req.params = { doctorId: 'doc1' };
      await getDoctorCredentials(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Not authorized to access this doctor profile', null)
      );
    });

    it('returns 404 if no credential found', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'doc1' };
      DoctorCredential.findOne.mockResolvedValue(null);
      await getDoctorCredentials(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'No credential found', null)
      );
    });

    it('returns credentials on success', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'doc1' };
      const fakeCredential = {
        _id: 'cred1',
        doctorId: 'doc1',
        fileName: 'credential.pdf',
        submittedAt: new Date(),
        status: 'Pending',
        reviewedAt: null,
        reason: null
      };
      DoctorCredential.findOne.mockResolvedValue(fakeCredential);
      await getDoctorCredentials(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Credential retrieved', {
          credentialId: 'cred1',
          doctorId: 'doc1',
          fileName: 'credential.pdf',
          submittedAt: fakeCredential.submittedAt,
          status: 'Pending',
          reviewedAt: null,
          reason: null
        })
      );
    });

    it('returns 500 on other errors', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'doc1' };
      DoctorCredential.findOne.mockRejectedValue(new Error('oops'));
      await getDoctorCredentials(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: oops', null)
      );
    });
  });

  describe('approveDoctorCredential', () => {
    it('returns 400 if doctorId or credentialId is invalid', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'invalid', credentialId: 'cred1' };
      await approveDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Invalid doctorId or credentialId', null)
      );
    });

    it('returns 403 if user is not admin', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      await approveDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Admin role required', null)
      );
    });

    it('returns 400 if adminId is invalid', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      req.body = { adminId: 'invalid' };
      await approveDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error', ['adminId must be a valid ObjectId'])
      );
    });

    it('returns 404 if credential not found', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      req.body = { adminId: 'admin1' };
      DoctorCredential.findOne.mockResolvedValue(null);
      await approveDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Credential not found', null)
      );
    });

    it('returns 409 if credential already reviewed', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      req.body = { adminId: 'admin1' };
      DoctorCredential.findOne.mockResolvedValue({ status: 'Approved' });
      await approveDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(409, 'Credential has already been reviewed', null)
      );
    });

    it('approves credential on success', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      req.body = { adminId: 'admin1' };
      const fakeCredential = {
        _id: 'cred1',
        doctorId: 'doc1',
        status: 'Pending',
        adminId: null,
        reviewedAt: null,
        save: jest.fn().mockResolvedValue()
      };
      DoctorCredential.findOne.mockResolvedValue(fakeCredential);
      await approveDoctorCredential(req, res);
      expect(fakeCredential.status).toBe('Approved');
      expect(fakeCredential.adminId).toBe('admin1');
      expect(fakeCredential.reviewedAt).toBeInstanceOf(Date);
      expect(fakeCredential.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Credential approved', {
          credentialId: 'cred1',
          doctorId: 'doc1',
          adminId: 'admin1',
          status: 'Approved',
          reviewedAt: fakeCredential.reviewedAt
        })
      );
    });

    it('returns 400 on Mongoose ValidationError', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      req.body = { adminId: 'admin1' };
      const err = new Error('fail');
      err.name = 'ValidationError';
      err.errors = { field: { message: 'bad' } };
      DoctorCredential.findOne.mockResolvedValue({
        status: 'Pending',
        save: jest.fn().mockRejectedValue(err)
      });
      await approveDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error: bad', null)
      );
    });

    it('returns 500 on other errors', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      req.body = { adminId: 'admin1' };
      DoctorCredential.findOne.mockRejectedValue(new Error('oops'));
      await approveDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Failed to process credential review: oops', null)
      );
    });
  });

  describe('rejectDoctorCredential', () => {
    it('returns 400 if doctorId or credentialId is invalid', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'invalid', credentialId: 'cred1' };
      await rejectDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Invalid doctorId or credentialId', null)
      );
    });

    it('returns 403 if user is not admin', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      await rejectDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Admin role required', null)
      );
    });

    it('returns 400 if reason is missing', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      req.body = { adminId: 'admin1', reason: '' };
      await rejectDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error', ['reason must be a non-empty string up to 1000 characters'])
      );
    });

    it('returns 404 if credential not found', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      req.body = { adminId: 'admin1', reason: 'Invalid document' };
      DoctorCredential.findOne.mockResolvedValue(null);
      await rejectDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Credential not found', null)
      );
    });

    it('returns 409 if credential already reviewed', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      req.body = { adminId: 'admin1', reason: 'Invalid document' };
      DoctorCredential.findOne.mockResolvedValue({ status: 'Rejected' });
      await rejectDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(409, 'Credential has already been reviewed', null)
      );
    });

    it('rejects credential on success', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      req.body = { adminId: 'admin1', reason: 'Invalid document' };
      const fakeCredential = {
        _id: 'cred1',
        doctorId: 'doc1',
        status: 'Pending',
        adminId: null,
        reviewedAt: null,
        reason: null,
        save: jest.fn().mockResolvedValue()
      };
      DoctorCredential.findOne.mockResolvedValue(fakeCredential);
      await rejectDoctorCredential(req, res);
      expect(fakeCredential.status).toBe('Rejected');
      expect(fakeCredential.adminId).toBe('admin1');
      expect(fakeCredential.reason).toBe('Invalid document');
      expect(fakeCredential.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Credential rejected', {
          credentialId: 'cred1',
          doctorId: 'doc1',
          adminId: 'admin1',
          status: 'Rejected',
          reviewedAt: fakeCredential.reviewedAt,
          reason: 'Invalid document'
        })
      );
    });

    it('returns 400 on Mongoose ValidationError', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      req.body = { adminId: 'admin1', reason: 'Invalid document' };
      const err = new Error('fail');
      err.name = 'ValidationError';
      err.errors = { field: { message: 'bad' } };
      DoctorCredential.findOne.mockResolvedValue({
        status: 'Pending',
        save: jest.fn().mockRejectedValue(err)
      });
      await rejectDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error: bad', null)
      );
    });

    it('returns 500 on other errors', async () => {
      req.user = { role: 'admin', userId: 'admin1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      req.body = { adminId: 'admin1', reason: 'Invalid document' };
      DoctorCredential.findOne.mockRejectedValue(new Error('oops'));
      await rejectDoctorCredential(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Failed to process credential review: oops', null)
      );
    });
  });

  describe('getDoctorCredentialById', () => {
    it('returns 400 if doctorId or credentialId is invalid', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'invalid', credentialId: 'cred1' };
      await getDoctorCredentialById(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Invalid doctorId or credentialId', null)
      );
    });

    it('returns 403 if user is not authorized', async () => {
      req.user = { role: 'doctor', userId: 'doc2' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      await getDoctorCredentialById(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Not authorized to view this credential', null)
      );
    });

    it('returns 404 if credential not found', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      DoctorCredential.findOne.mockResolvedValue(null);
      await getDoctorCredentialById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Credential not found', null)
      );
    });

    it('returns credential on success', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      const fakeCredential = {
        _id: 'cred1',
        doctorId: 'doc1',
        fileName: 'credential.pdf',
        submittedAt: new Date(),
        status: 'Pending',
        reviewedAt: null,
        reason: null,
        adminId: null
      };
      DoctorCredential.findOne.mockResolvedValue(fakeCredential);
      await getDoctorCredentialById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Credential retrieved', {
          credentialId: 'cred1',
          doctorId: 'doc1',
          fileName: 'credential.pdf',
          submittedAt: fakeCredential.submittedAt,
          status: 'Pending',
          reviewedAt: null,
          reason: null,
          adminId: null
        })
      );
    });

    it('returns 500 on other errors', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.params = { doctorId: 'doc1', credentialId: 'cred1' };
      DoctorCredential.findOne.mockRejectedValue(new Error('oops'));
      await getDoctorCredentialById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: oops', null)
      );
    });
  });
});
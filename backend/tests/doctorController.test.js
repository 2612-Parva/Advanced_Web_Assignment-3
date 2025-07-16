const { 
  getDoctorProfile,
  updateBasicDoctorProfile,
  updateAvailability,
  updateDoctorAddress,
  getAvailability,
  uploadProfilePicture,
  getPublicDoctorProfile,
  listDoctors
} = require('../controllers/doctorController');

const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { responseBody } = require('../config/responseBody');

jest.mock('../models/Doctor');
jest.mock('../models/User');

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
        responseBody(403, 'Forbidden: Only doctors can access their profile', null)
      );
    });

    it('returns 404 if doctor profile not found', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      Doctor.findOne.mockResolvedValue(null);
      
      await getDoctorProfile(req, res);
      
      expect(Doctor.findOne).toHaveBeenCalledWith({ userId: 'doc1' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Doctor profile not found', null)
      );
    });

    it('returns profile on success', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      const mockDoctor = { 
        toObject: jest.fn().mockReturnValue({ 
          _id: 'doc1',
          specialization: ['Cardiologist'],
          bio: 'Experienced doctor'
        })
      };
      const mockUser = { 
        fullName: 'Dr. Smith', 
        email: 'doctor@test.com' 
      };
      
      Doctor.findOne.mockResolvedValue(mockDoctor);
      User.findById.mockResolvedValue(mockUser);
      
      await getDoctorProfile(req, res);
      
      expect(Doctor.findOne).toHaveBeenCalledWith({ userId: 'doc1' });
      expect(User.findById).toHaveBeenCalledWith('doc1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Doctor profile retrieved successfully', expect.objectContaining({
          _id: 'doc1',
          specialization: ['Cardiologist'],
          bio: 'Experienced doctor',
          fullName: 'Dr. Smith',
          email: 'doctor@test.com'
        }))
      );
    });

    it('returns 500 on database error', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      Doctor.findOne.mockRejectedValue(new Error('Database error'));
      
      await getDoctorProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Unable to fetch doctor profile', null)
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
        responseBody(403, 'Forbidden: Only doctors can update their profile', null)
      );
    });

    it('returns 404 if doctor profile not found', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { bio: 'New bio' };
      Doctor.findOneAndUpdate.mockResolvedValue(null);
      
      await updateBasicDoctorProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Doctor profile not found', null)
      );
    });

    it('successfully updates profile and returns 200', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { bio: 'Updated bio', specialization: ['Cardiologist'] };
      const updatedDoctor = { 
        _id: 'doc1', 
        bio: 'Updated bio', 
        specialization: ['Cardiologist'] 
      };
      
      Doctor.findOneAndUpdate.mockResolvedValue(updatedDoctor);
      
      await updateBasicDoctorProfile(req, res);
      
      expect(Doctor.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'doc1' },
        { bio: 'Updated bio', specialization: ['Cardiologist'] },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Doctor profile updated successfully', updatedDoctor)
      );
    });

    it('returns 500 on database error', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { bio: 'New bio' };
      Doctor.findOneAndUpdate.mockRejectedValue(new Error('Database error'));
      
      await updateBasicDoctorProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Unable to update profile', null)
      );
    });
  });

  describe('updateAvailability', () => {
    it('returns 403 if no user or wrong role', async () => {
      req.user = { role: 'patient', userId: 'u1' };
      req.body = { availability: [] };
      
      await updateAvailability(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Forbidden: Only doctors can set availability', null)
      );
    });

    it('returns 400 if availability data is invalid', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { availability: null };
      
      await updateAvailability(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Invalid availability data', null)
      );
    });

    it('returns 404 if doctor profile not found', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { availability: [] };
      Doctor.findOne.mockResolvedValue(null);
      
      await updateAvailability(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Doctor profile not found', null)
      );
    });

    it('successfully updates availability and returns 200', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      const availability = [{ date: '2024-01-01', slots: ['09:00', '10:00'] }];
      req.body = { availability };
      
      const mockDoctor = {
        availability: [],
        save: jest.fn().mockResolvedValue()
      };
      Doctor.findOne.mockResolvedValue(mockDoctor);
      
      await updateAvailability(req, res);
      
      expect(mockDoctor.availability).toEqual(availability);
      expect(mockDoctor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Availability updated successfully', availability)
      );
    });

    it('returns 500 on database error', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { availability: [] };
      Doctor.findOne.mockRejectedValue(new Error('Database error'));
      
      await updateAvailability(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Unable to update availability', null)
      );
    });
  });

  describe('updateDoctorAddress', () => {
    it('returns 403 if no user or wrong role', async () => {
      req.user = { role: 'patient', userId: 'u1' };
      req.body = { address: 'Test Address', coordinates: [0, 0] };
      
      await updateDoctorAddress(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Forbidden: Only doctors can update address', null)
      );
    });

    it('returns 400 if address or coordinates are missing', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { address: 'Test Address' };
      
      await updateDoctorAddress(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Validation error: address and [lng, lat] coordinates are required', null)
      );
    });

    it('returns 400 if coordinates are invalid range', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { address: 'Test Address', coordinates: [200, 95] };
      
      await updateDoctorAddress(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Invalid coordinates provided', null)
      );
    });

    it('returns 404 if doctor profile not found', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { address: 'Test Address', coordinates: [0, 0] };
      Doctor.findOneAndUpdate.mockResolvedValue(null);
      
      await updateDoctorAddress(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Doctor profile not found', null)
      );
    });

    it('successfully updates address and returns 200', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { address: 'Test Address', coordinates: [0, 0] };
      const updatedDoctor = { 
        address: 'Test Address', 
        location: { type: 'Point', coordinates: [0, 0] }
      };
      
      Doctor.findOneAndUpdate.mockResolvedValue(updatedDoctor);
      
      await updateDoctorAddress(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Address updated successfully', {
          address: 'Test Address',
          location: { type: 'Point', coordinates: [0, 0] }
        })
      );
    });

    it('returns 500 on database error', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.body = { address: 'Test Address', coordinates: [0, 0] };
      Doctor.findOneAndUpdate.mockRejectedValue(new Error('Database error'));
      
      await updateDoctorAddress(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Unable to update address', null)
      );
    });
  });

  describe('getAvailability', () => {
    it('returns 403 if no user or wrong role', async () => {
      req.user = { role: 'patient', userId: 'u1' };
      
      await getAvailability(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Forbidden: Only doctors can view availability', null)
      );
    });

    it('returns 404 if doctor profile not found', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      Doctor.findOne.mockResolvedValue(null);
      
      await getAvailability(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Doctor profile not found', null)
      );
    });

    it('successfully returns availability and returns 200', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      const availability = [{ date: '2024-01-01', slots: ['09:00', '10:00'] }];
      const mockDoctor = { availability };
      
      Doctor.findOne.mockResolvedValue(mockDoctor);
      
      await getAvailability(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Availability retrieved successfully', availability)
      );
    });

    it('returns 500 on database error', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      Doctor.findOne.mockRejectedValue(new Error('Database error'));
      
      await getAvailability(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Unable to get availability', null)
      );
    });
  });

  describe('uploadProfilePicture', () => {
    it('returns 403 if no user or wrong role', async () => {
      req.user = { role: 'patient', userId: 'u1' };
      req.file = { buffer: Buffer.from('test'), mimetype: 'image/jpeg' };
      
      await uploadProfilePicture(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(403, 'Forbidden: Only doctors can upload profile picture', null)
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
      req.file = { buffer: Buffer.from('test'), mimetype: 'text/plain', size: 1000 };
      
      await uploadProfilePicture(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Invalid file type. Only JPEG, PNG allowed', null)
      );
    });

    it('returns 400 if file size is too large', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.file = { 
        buffer: Buffer.from('test'), 
        mimetype: 'image/jpeg', 
        size: 6 * 1024 * 1024 // 6MB
      };
      
      await uploadProfilePicture(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'File too large. Maximum size is 5MB', null)
      );
    });

    it('returns 404 if doctor profile not found', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.file = { buffer: Buffer.from('test'), mimetype: 'image/jpeg', size: 1000 };
      Doctor.findOne.mockResolvedValue(null);
      
      await uploadProfilePicture(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Doctor profile not found', null)
      );
    });

    it('successfully uploads profile picture and returns 200', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.file = { buffer: Buffer.from('test'), mimetype: 'image/jpeg', size: 1000 };
      const mockDoctor = {
        profilePicture: null,
        save: jest.fn().mockResolvedValue()
      };
      
      Doctor.findOne.mockResolvedValue(mockDoctor);
      
      await uploadProfilePicture(req, res);
      
      expect(mockDoctor.profilePicture).toEqual({
        data: req.file.buffer,
        contentType: req.file.mimetype
      });
      expect(mockDoctor.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Profile picture updated successfully', null)
      );
    });

    it('returns 500 on database error', async () => {
      req.user = { role: 'doctor', userId: 'doc1' };
      req.file = { buffer: Buffer.from('test'), mimetype: 'image/jpeg', size: 1000 };
      Doctor.findOne.mockRejectedValue(new Error('Database error'));
      
      await uploadProfilePicture(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Unable to upload profile picture', null)
      );
    });
  });

  describe('getPublicDoctorProfile', () => {
    it('returns 404 if doctor not found', async () => {
      req.params = { doctorId: 'doc1' };
      Doctor.findOne.mockResolvedValue(null);
      
      await getPublicDoctorProfile(req, res);
      
      expect(Doctor.findOne).toHaveBeenCalledWith({ doctorId: 'doc1' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(404, 'Doctor not found', null)
      );
    });

    it('successfully returns public profile and returns 200', async () => {
      req.params = { doctorId: 'doc1' };
      const mockDoctor = {
        userId: { fullName: 'Dr. Smith' },
        specialization: ['Cardiologist'],
        bio: 'Experienced doctor',
        location: { coordinates: [0, 0] },
        education: 'MD from Harvard',
        availability: []
      };
      
      Doctor.findOne.mockResolvedValue(mockDoctor);
      
      await getPublicDoctorProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Doctor profile retrieved', {
          fullName: 'Dr. Smith',
          specialization: ['Cardiologist'],
          bio: 'Experienced doctor',
          location: { coordinates: [0, 0] },
          education: 'MD from Harvard',
          availability: []
        })
      );
    });

    it('returns 500 on database error', async () => {
      req.params = { doctorId: 'doc1' };
      Doctor.findOne.mockRejectedValue(new Error('Database error'));
      
      await getPublicDoctorProfile(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Unable to retrieve doctor profile', null)
      );
    });
  });

  describe('listDoctors', () => {
    it('returns 400 if coordinates are invalid', async () => {
      req.query = { lng: '200', lat: '95' };
      
      await listDoctors(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(400, 'Invalid coordinates provided', null)
      );
    });

    it('successfully returns doctors list with pagination', async () => {
      req.query = { specialization: 'Cardiologist', page: '1', limit: '10' };
      const mockDoctors = [
        { userId: { fullName: 'Dr. Smith' }, specialization: ['Cardiologist'] }
      ];
      
      Doctor.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockDoctors)
            })
          })
        })
      });
      Doctor.countDocuments.mockResolvedValue(1);
      
      await listDoctors(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(200, 'Doctors retrieved successfully', {
          doctors: mockDoctors,
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            pages: 1
          }
        })
      );
    });

    it('returns 500 on database error', async () => {
      req.query = {};
      Doctor.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockRejectedValue(new Error('Database error'))
            })
          })
        })
      });
      
      await listDoctors(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        responseBody(500, 'Internal Server Error: Unable to retrieve doctors', null)
      );
    });
  });
});
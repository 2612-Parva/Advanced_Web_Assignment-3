const { bookAppointment } = require('../controllers/appointmentController');
const Appointment         = require('../models/Appointments');
const { responseBody }    = require('../config/responseBody');

jest.mock('../models/Appointments');

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe('bookAppointment', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json:   jest.fn()
    };
    jest.clearAllMocks();
  });

  it('returns 403 if no user or wrong role', async () => {
    req.user = { role: 'doctor', userId: 'u1' };
    await bookAppointment(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      responseBody(403, 'Forbidden: Only patients can book appointments', null)
    );
  });

  it('returns 400 if doctorId or scheduledFor is missing', async () => {
    req.user = { role: 'patient', userId: 'u1' };
    req.body = { reason: 'checkup' };
    await bookAppointment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      responseBody(400, 'Validation error: patientId, doctorId, and scheduledFor are required', null)
    );
  });

  it('returns 409 if there is a conflicting appointment', async () => {
    req.user = { role: 'patient', userId: 'u1' };
    req.body = { doctorId: 'd1', scheduledFor: new Date().toISOString(), reason: 'x' };
    Appointment.findOne.mockResolvedValue({ _id: 'conflict' });

    await bookAppointment(req, res);

    expect(Appointment.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      responseBody(409, 'Conflict error: Doctor is already booked for this time slot', null)
    );
  });

  it('creates and returns 201 on success', async () => {
    req.user = { role: 'patient', userId: 'u1' };
    const nowIso = new Date().toISOString();
    req.body = { doctorId: 'd1', scheduledFor: nowIso, reason: 'x' };

    Appointment.findOne.mockResolvedValue(null);
    const fakeAppt = {
      _id: 'a1',
      patientId: 'u1',
      doctorId: 'd1',
      scheduledFor: new Date(nowIso),
      date: new Date(),
      time: '12:00',
      reason: 'x',
      status: 'scheduled',
      save: jest.fn().mockResolvedValue()
    };
    Appointment.mockImplementation(() => fakeAppt);

    await bookAppointment(req, res);

    expect(Appointment.findOne).toHaveBeenCalled();
    expect(fakeAppt.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      responseBody(201, 'Appointment booked successfully', {
        appointmentId: 'a1',
        patientId: 'u1',
        doctorId: 'd1',
        scheduledFor: fakeAppt.scheduledFor,
        date: fakeAppt.date,
        time: fakeAppt.time,
        reason: fakeAppt.reason,
        status: fakeAppt.status
      })
    );
  });

  it('returns 400 on Mongoose ValidationError', async () => {
    req.user = { role: 'patient', userId: 'u1' };
    req.body = { doctorId: 'd1', scheduledFor: new Date().toISOString(), reason: 'x' };
    Appointment.findOne.mockResolvedValue(null);
    const err = new Error('fail');
    err.name = 'ValidationError';
    err.errors = { field: { message: 'bad' } };
    // simulate save throwing
    Appointment.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(err)
    }));

    await bookAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      responseBody(400, 'Validation error: bad', null)
    );
  });

  it('returns 500 on other errors', async () => {
    req.user = { role: 'patient', userId: 'u1' };
    req.body = { doctorId: 'd1', scheduledFor: new Date().toISOString(), reason: 'x' };
    Appointment.findOne.mockRejectedValue(new Error('oops'));

    await bookAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      responseBody(500, 'Internal Server Error: Unable to book appointment', null)
    );
  });
});

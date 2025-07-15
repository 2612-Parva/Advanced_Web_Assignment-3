import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { type RootState } from './store';

interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  scheduledFor: string;
  date: string;
  time: string;
  reason: string;
  status: string;
}

interface AppointmentState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,
};

// Helper function for API requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`http://localhost:8080/api${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const bookAppointment = createAsyncThunk(
  'appointment/book',
  async (appointmentData: { doctorId: string; scheduledFor: string; reason: string }, { rejectWithValue }) => {
    try {
      const data = await fetchWithAuth('/appointments/book', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });
      return data.body;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAppointments = createAsyncThunk(
  'appointment/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchWithAuth('/appointments');
      return data.body;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAppointmentById = createAsyncThunk(
  'appointment/getById',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const data = await fetchWithAuth(`/appointments/${appointmentId}`);
      return data.body;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointment/cancel',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const data = await fetchWithAuth(`/appointments/cancel/${appointmentId}`, {
        method: 'PUT',
      });
      return data.body;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const rescheduleAppointment = createAsyncThunk(
  'appointment/reschedule',
  async ({ appointmentId, scheduledFor, reason }: { appointmentId: string; scheduledFor: string; reason?: string }, { rejectWithValue }) => {
    try {
      const data = await fetchWithAuth(`/appointments/reschedule/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ scheduledFor, reason }),
      });
      return data.body;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsNoShow = createAsyncThunk(
  'appointment/noShow',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const data = await fetchWithAuth(`/appointments/no-show/${appointmentId}`, {
        method: 'PUT',
      });
      return data.body;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointment/delete',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      await fetchWithAuth(`/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      return appointmentId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    clearSelectedAppointment: (state) => {
      state.selectedAppointment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Book Appointment
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.push(action.payload);
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get All Appointments
      .addCase(getAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(getAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Appointment By ID
      .addCase(getAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAppointment = action.payload;
      })
      .addCase(getAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Cancel Appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.selectedAppointment?._id === action.payload._id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Reschedule Appointment
      .addCase(rescheduleAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.selectedAppointment?._id === action.payload._id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(rescheduleAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Mark as No-Show
      .addCase(markAsNoShow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAsNoShow.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.selectedAppointment?._id === action.payload._id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(markAsNoShow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = state.appointments.filter(a => a._id !== action.payload);
        if (state.selectedAppointment?._id === action.payload) {
          state.selectedAppointment = null;
        }
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedAppointment } = appointmentSlice.actions;

export const selectAppointments = (state: RootState) => state.appointment.appointments;
export const selectSelectedAppointment = (state: RootState) => state.appointment.selectedAppointment;
export const selectAppointmentLoading = (state: RootState) => state.appointment.loading;
export const selectAppointmentError = (state: RootState) => state.appointment.error;

export default appointmentSlice.reducer;
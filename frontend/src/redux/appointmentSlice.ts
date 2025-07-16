import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
declare type RequestInit = globalThis.RequestInit;

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

interface ApiResponse<T> {
  body: T;
  message?: string;
}

const initialState: AppointmentState = {
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,
};

const fetchWithAuth = async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
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
      const { body } = await fetchWithAuth<Appointment>('/appointments/book', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });
      return body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const getAppointments = createAsyncThunk(
  'appointment/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { body } = await fetchWithAuth<Appointment[]>('/appointments');
      return body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const getAppointmentById = createAsyncThunk(
  'appointment/getById',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const { body } = await fetchWithAuth<Appointment>(`/appointments/${appointmentId}`);
      return body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointment/cancel',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const { body } = await fetchWithAuth<Appointment>(`/appointments/cancel/${appointmentId}`, {
        method: 'PUT',
      });
      return body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const rescheduleAppointment = createAsyncThunk(
  'appointment/reschedule',
  async ({ appointmentId, scheduledFor, reason }: { appointmentId: string; scheduledFor: string; reason?: string }, { rejectWithValue }) => {
    try {
      const { body } = await fetchWithAuth<Appointment>(`/appointments/reschedule/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ scheduledFor, reason }),
      });
      return body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const markAsNoShow = createAsyncThunk(
  'appointment/noShow',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const { body } = await fetchWithAuth<Appointment>(`/appointments/no-show/${appointmentId}`, {
        method: 'PUT',
      });
      return body;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

export const deleteAppointment = createAsyncThunk(
  'appointment/delete',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      await fetchWithAuth<void>(`/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      return appointmentId;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
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
      .addCase(bookAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        state.appointments.push(action.payload);
      })
      .addCase(bookAppointment.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get All Appointments
      .addCase(getAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(getAppointments.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Appointment By ID
      .addCase(getAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentById.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        state.selectedAppointment = action.payload;
      })
      .addCase(getAppointmentById.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Cancel Appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        const index = state.appointments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.selectedAppointment?._id === action.payload._id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(cancelAppointment.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Reschedule Appointment
      .addCase(rescheduleAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        const index = state.appointments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.selectedAppointment?._id === action.payload._id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(rescheduleAppointment.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Mark as No-Show
      .addCase(markAsNoShow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAsNoShow.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        const index = state.appointments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
        if (state.selectedAppointment?._id === action.payload._id) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(markAsNoShow.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.appointments = state.appointments.filter(a => a._id !== action.payload);
        if (state.selectedAppointment?._id === action.payload) {
          state.selectedAppointment = null;
        }
      })
      .addCase(deleteAppointment.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedAppointment } = appointmentSlice.actions;

export const selectAppointments = (state: { appointment: AppointmentState }) => state.appointment.appointments;
export const selectSelectedAppointment = (state: { appointment: AppointmentState }) => state.appointment.selectedAppointment;
export const selectAppointmentLoading = (state: { appointment: AppointmentState }) => state.appointment.loading;
export const selectAppointmentError = (state: { appointment: AppointmentState }) => state.appointment.error;

export default appointmentSlice.reducer;
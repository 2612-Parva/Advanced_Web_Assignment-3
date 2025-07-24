import { createReducer } from '@reduxjs/toolkit';
import { DOCTOR_ACTION_TYPES, type DoctorState } from '../types/doctorTypes';
import { approveDoctorCredential, getAvailability, getDoctorCredentials, getDoctorProfile, getPublicDoctorProfile, listDoctors, rejectDoctorCredential, submitDoctorCredential, updateAvailability, updateBasicDoctorProfile, uploadProfilePicture } from '../actions/doctorActions';

const initialState: DoctorState = {
  profile: null,
  availability: [],
  credentials: [],
  doctorsList: [],
  publicProfile: null,
  loading: false,
  error: null,
  success: false,
};

const doctorReducer = createReducer(initialState, (builder) => {
  builder
    // Profile Actions
    .addCase(getDoctorProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getDoctorProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
      state.success = true;
    })
    .addCase(getDoctorProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(updateBasicDoctorProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateBasicDoctorProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
      state.success = true;
    })
    .addCase(updateBasicDoctorProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(uploadProfilePicture.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(uploadProfilePicture.fulfilled, (state, action) => {
      state.loading = false;
      if (state.profile) {
        state.profile.profilePicture = action.payload;
      }
      state.success = true;
    })
    .addCase(uploadProfilePicture.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Availability Actions
    .addCase(updateAvailability.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateAvailability.fulfilled, (state, action) => {
      state.loading = false;
      state.availability = action.payload;
      state.success = true;
    })
    .addCase(updateAvailability.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(getAvailability.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getAvailability.fulfilled, (state, action) => {
      state.loading = false;
      state.availability = action.payload;
      state.success = true;
    })
    .addCase(getAvailability.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Credentials Actions
    .addCase(submitDoctorCredential.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(submitDoctorCredential.fulfilled, (state, action) => {
      state.loading = false;
      state.credentials = [action.payload, ...state.credentials];
      state.success = true;
    })
    .addCase(submitDoctorCredential.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(getDoctorCredentials.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getDoctorCredentials.fulfilled, (state, action) => {
      state.loading = false;
      state.credentials = action.payload;
      state.success = true;
    })
    .addCase(getDoctorCredentials.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(approveDoctorCredential.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(approveDoctorCredential.fulfilled, (state, action) => {
      state.loading = false;
      state.credentials = state.credentials.map(cred => 
        cred._id === action.payload._id ? action.payload : cred
      );
      state.success = true;
    })
    .addCase(approveDoctorCredential.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(rejectDoctorCredential.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(rejectDoctorCredential.fulfilled, (state, action) => {
      state.loading = false;
      state.credentials = state.credentials.map(cred => 
        cred._id === action.payload._id ? action.payload : cred
      );
      state.success = true;
    })
    .addCase(rejectDoctorCredential.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Public Actions
    .addCase(getPublicDoctorProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getPublicDoctorProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.publicProfile = action.payload;
      state.success = true;
    })
    .addCase(getPublicDoctorProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(listDoctors.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(listDoctors.fulfilled, (state, action) => {
      state.loading = false;
      state.doctorsList = action.payload.doctors;
      state.success = true;
    })
    .addCase(listDoctors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Reset State
    .addCase(DOCTOR_ACTION_TYPES.RESET_DOCTOR_STATE, () => initialState);
});

export default doctorReducer;
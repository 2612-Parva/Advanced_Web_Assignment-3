import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name?: string;
  isVerified: boolean;
  role: 'patient' | 'doctor' | 'admin';
}

interface VerificationResponse {
  isVerified: boolean;
  user?: User;
}

interface UserState {
  profile: any;
  role: any;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  verificationStatus: 'pending' | 'verified' | 'unverified' | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
  verificationStatus: null,
  profile: undefined,
  role: undefined
};

export const checkVerificationStatus = createAsyncThunk(
  'user/checkVerificationStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/verify-status', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to check verification status');
      }
      
      const data = await response.json();
      return {
        isVerified: data.isVerified,
        user: data.user 
      } as VerificationResponse;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'user/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      if (!response.ok) {
        throw new Error('Email verification failed');
      }
      return { success: true };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
      state.verificationStatus = action.payload.isVerified ? 'verified' : 'unverified';
      state.error = null;
    },
    registerSuccess(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
      state.verificationStatus = 'unverified';
      state.error = null;
    },
    clearUserError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkVerificationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkVerificationStatus.fulfilled, (state, action: PayloadAction<VerificationResponse>) => {
        state.loading = false;
        state.verificationStatus = action.payload.isVerified ? 'verified' : 'unverified';
        
        if (action.payload.user) {
          state.currentUser = action.payload.user;
        } else if (state.currentUser) {
          state.currentUser.isVerified = action.payload.isVerified;
        }
      })
      .addCase(checkVerificationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.verificationStatus = null;
      })
      
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.verificationStatus = 'verified';
        if (state.currentUser) {
          state.currentUser.isVerified = true;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { loginSuccess, registerSuccess, clearUserError } = userSlice.actions;
export default userSlice.reducer;
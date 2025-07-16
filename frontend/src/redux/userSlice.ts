import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  isVerified: boolean;
  role: 'patient' | 'doctor' | 'admin';
  profile?: UserProfile;
}

interface VerificationResponse {
  isVerified: boolean;
  user?: User;
}

interface UserState {
  profile: any;
  userId: string | undefined;
  role: 'patient' | 'doctor' | 'admin' | undefined;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  verificationStatus: 'pending' | 'verified' | 'unverified' | null;
}

const initialState: UserState = {
  userId: undefined,
  currentUser: null,
  loading: false,
  error: null,
  verificationStatus: null,
  role: undefined,
  profile: undefined
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
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unknown error occurred');
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
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unknown error occurred');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
      state.userId = action.payload.id;
      state.role = action.payload.role;
      state.verificationStatus = action.payload.isVerified ? 'verified' : 'unverified';
      state.error = null;
    },
    registerSuccess(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
      state.userId = action.payload.id;
      state.role = action.payload.role;
      state.verificationStatus = 'unverified';
      state.error = null;
    },
    clearUserError(state) {
      state.error = null;
    },
    updateUserProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.currentUser) {
        state.currentUser.profile = {
          ...state.currentUser.profile,
          ...action.payload,
          fullName: action.payload.fullName ?? state.currentUser.profile?.fullName ?? '',
          email: action.payload.email ?? state.currentUser.profile?.email ?? ''
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkVerificationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkVerificationStatus.fulfilled, (
        state, 
        action: PayloadAction<VerificationResponse>
      ) => {
        state.loading = false;
        state.verificationStatus = action.payload.isVerified ? 'verified' : 'unverified';
        
        if (action.payload.user) {
          state.currentUser = action.payload.user;
          state.userId = action.payload.user.id;
          state.role = action.payload.user.role;
        } else if (state.currentUser) {
          state.currentUser.isVerified = action.payload.isVerified;
        }
      })
      .addCase(checkVerificationStatus.rejected, (state, action: PayloadAction<unknown>) => {
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
      .addCase(verifyEmail.rejected, (state, action: PayloadAction<unknown>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  loginSuccess, 
  registerSuccess, 
  clearUserError,
  updateUserProfile 
} = userSlice.actions;

export default userSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  currentUser: any; // Replace `any` with a proper type if available
}

const initialState: UserState = {
  currentUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<any>) {
      state.currentUser = action.payload;
    },
    registerSuccess(state, action: PayloadAction<any>) {
      state.currentUser = action.payload;
    },
    logout(state) {
      state.currentUser = null;
    },
  },
});

export const { loginSuccess, registerSuccess, logout } = userSlice.actions;
export default userSlice.reducer;

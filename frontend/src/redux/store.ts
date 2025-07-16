import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import userReducer from './userSlice';

const initialReducers = {
  auth: authReducer,
  user: userReducer,
  appointment: (state = {}) => state 
};
import appointmentReducer from './appointmentSlice';

const finalReducers = {
  ...initialReducers,
  appointment: appointmentReducer 
};

export const store = configureStore({
  reducer: finalReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['payload.headers', 'payload.config'],
        ignoredPaths: ['auth.refreshToken', 'auth.accessToken'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
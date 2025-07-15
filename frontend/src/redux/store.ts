import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; 
import appointmentReducer from './appointmentSlice'; 
import userReducer from './userSlice'; 

export const store = configureStore({
  reducer: {
    auth: authReducer, 
    appointment: appointmentReducer, 
    user: userReducer, 
  },
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
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

import {
  selectAccessToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthState
} from '../redux/selectors/authSelectors';

import {
  selectCurrentUser,
  selectUserRole,
  selectUserProfile,
  selectVerificationStatus,
  selectIsVerified
} from '../redux/selectors/userSelectors';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAccessToken = () => useAppSelector(selectAccessToken);
export const useIsAuthenticated = () => useAppSelector(selectIsAuthenticated);
export const useAuthLoading = () => useAppSelector(selectAuthLoading);
export const useAuthError = () => useAppSelector(selectAuthError);
export const useAuth = () => useAppSelector(selectAuthState);

export const useUser = () => useAppSelector(selectCurrentUser);
export const useUserRole = () => useAppSelector(selectUserRole);
export const useUserProfile = () => useAppSelector(selectUserProfile);
export const useVerificationStatus = () => useAppSelector(selectVerificationStatus);
export const useIsVerified = () => useAppSelector(selectIsVerified);

export const useAppointments = () => useAppSelector((state) => state.appointment.appointments);
export const useSelectedAppointment = () => useAppSelector((state) => state.appointment.selectedAppointment);
export const useAppointmentLoading = () => useAppSelector((state) => state.appointment.loading);
export const useAppointmentError = () => useAppSelector((state) => state.appointment.error);

export const useUpcomingAppointments = () => 
  useAppSelector((state) => 
    state.appointment.appointments.filter(
      (appt) => new Date(appt.scheduledFor) > new Date()
    )
  );

export const usePastAppointments = () => 
  useAppSelector((state) => 
    state.appointment.appointments.filter(
      (appt) => new Date(appt.scheduledFor) <= new Date()
    )
  );

export const useDoctorAppointments = (doctorId: string) => 
  useAppSelector((state) => 
    state.appointment.appointments.filter(
      (appt) => appt.doctorId === doctorId
    )
  );

export const usePatientAppointments = (patientId: string) =>
  useAppSelector((state) =>
    state.appointment.appointments.filter(
      (appt) => appt.patientId === patientId
    )
  );
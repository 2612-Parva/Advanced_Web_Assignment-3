import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuth = () => useAppSelector((state) => state.auth);
export const useAccessToken = () => useAppSelector((state) => state.auth.accessToken);
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated);
export const useAuthLoading = () => useAppSelector((state) => state.auth.loading);
export const useAuthError = () => useAppSelector((state) => state.auth.error);

export const useUser = () => useAppSelector((state) => state.user);
export const useUserRole = () => useAppSelector((state) => state.user?.role);
export const useUserProfile = () => useAppSelector((state) => state.user?.profile);

export const useAppointments = () => useAppSelector((state) => state.appointment.appointments);
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
export const useSelectedAppointment = () => useAppSelector((state) => state.appointment.selectedAppointment);
export const useAppointmentLoading = () => useAppSelector((state) => state.appointment.loading);
export const useAppointmentError = () => useAppSelector((state) => state.appointment.error);
export const useDoctorAppointments = (doctorId: string) => 
  useAppSelector((state) => 
    state.appointment.appointments.filter(
      (appt) => appt.doctorId === doctorId
    )
  );
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingSpinner from './pages/LoadingSpinner'; 

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const PatientRegister = lazy(() => import('./pages/PatientRegister'));
const DoctorRegister = lazy(() => import('./pages/DoctorRegister'));
const AppointmentBooking = lazy(() => import('./pages/AppointmentBooking'));
const DoctorSelection = lazy(() => import('./pages/DoctorSelection'));
const DoctorProfile = lazy(() => import('./pages/DoctorProfile'));
const PatientProfile = lazy(() => import('./pages/PatientProfile'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyOtpPage = lazy(() => import('./pages/VerifyOtp'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const PatientCalendar = lazy(() => import('./pages/PatientCalendar'));
const DoctorCalendar = lazy(() => import('./pages/DoctorCalendar'));
const BookAppointment = lazy(() => import('./pages/AppointmentBooking'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

function App() {
  return (
    <div data-testid="app-container">
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/patientregister" element={<PatientRegister />} />
            <Route path="/doctorregister" element={<DoctorRegister />} />
            <Route path="/book-appointment" element={<AppointmentBooking />} />
            <Route path="/select-doctor" element={<DoctorSelection />} />
            <Route path="/doctor-profile" element={<DoctorProfile />} />
            <Route path="/patient-profile" element={<PatientProfile />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/patient-calendar" element={<PatientCalendar />} />
            <Route path="/doctor-calendar" element={<DoctorCalendar />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/patient/book-appointment" element={<BookAppointment />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
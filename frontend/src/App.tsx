// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import PatientRegister from './pages/PatientRegister'
import DoctorRegister from './pages/DoctorRegister'
import Home from './pages/Home'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/patientregister" element={<PatientRegister />} />
        <Route path="/doctorregister" element={<DoctorRegister />} />
        <Route path="*" element={<Home/>} /> 

      </Routes>
    </Router>
  )
}

export default App

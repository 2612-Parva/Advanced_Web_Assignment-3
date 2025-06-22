// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import PatientRegister from './pages/PatientRegister'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/patientregister" element={<PatientRegister />} />
        <Route path="*" element={<Login />} /> {/* Fallback route */}
      </Routes>
    </Router>
  )
}

export default App

import { useState } from 'react'

function DoctorRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    specialty: '',
    age: '',
    gender: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(JSON.stringify(form, null, 2))
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Illustration Side */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 to-blue-700 text-white p-10 rounded-3xl shadow-md">
          <h1 className="text-4xl font-bold mb-4 text-pink-400">Hello<span className="text-white">Doc</span></h1>
          <img src="/login-illustration.png" alt="Doctor" className="w-80 h-auto mb-6" />
          <p className="text-lg font-semibold text-center mb-2">Welcome, Doctor!</p>
          <p className="text-sm text-center max-w-md">
            Sign up to manage appointments, consult patients, and deliver quality care on HelloDoc.
          </p>
        </div>

        {/* Form Side */}
        <div className="bg-white p-8 shadow-lg rounded-2xl">
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-full border border-gray-300 overflow-hidden">
              <a href="/patientregister" className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Patient</a>
              <span className="px-6 py-2 text-sm font-medium bg-blue-800 text-white">Doctor</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Your Doctor Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Full Name" className="border p-3 rounded w-full" value={form.name} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email Address" className="border p-3 rounded w-full" value={form.email} onChange={handleChange} required />
              <input type="text" name="phone" placeholder="Phone Number" className="border p-3 rounded w-full" value={form.phone} onChange={handleChange} required />
              <input type="date" name="dob" className="border p-3 rounded w-full" value={form.dob} onChange={handleChange} required />
              <select name="specialty" className="border p-3 rounded w-full" value={form.specialty} onChange={handleChange} required>
                <option value="">Select Specialty</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
              </select>
              <select name="age" className="border p-3 rounded w-full" value={form.age} onChange={handleChange} required>
                <option value="">Select Age</option>
                {Array.from({ length: 83 }, (_, i) => (
                  <option key={i} value={i + 18}>{i + 18}</option>
                ))}
              </select>
              <select name="gender" className="border p-3 rounded w-full" value={form.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" className="border p-3 rounded w-full" value={form.password} onChange={handleChange} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-3 right-3 text-sm text-blue-600">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" className="border p-3 rounded w-full" value={form.confirmPassword} onChange={handleChange} required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-3 right-3 text-sm text-blue-600">
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-800 text-white py-3 rounded hover:bg-blue-900 transition">Register</button>
          </form>

          <p className="text-sm text-center mt-6 text-gray-600">
            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default DoctorRegister;

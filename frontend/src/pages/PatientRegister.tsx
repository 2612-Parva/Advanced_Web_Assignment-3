import { useState } from 'react'

function PatientRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    age: '',
    gender: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(JSON.stringify(form, null, 2))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-10">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm overflow-hidden border border-gray-300">
            <button type="button" className="bg-blue-800 text-white px-6 py-2 text-sm font-medium">Patient</button>
            <button type="button" className="bg-white text-gray-800 px-6 py-2 text-sm font-medium hover:bg-gray-100">Doctor</button>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Sign In</h1>
        <p className="text-sm text-gray-600 mb-6">Let’s Get You All Set Up So You Can Access Your Personal Account.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="name" placeholder="Enter Name" className="border p-2 rounded" value={form.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Enter E-Mail" className="border p-2 rounded" value={form.email} onChange={handleChange} required />
          <input type="text" name="phone" placeholder="Enter Phone Number" className="border p-2 rounded" value={form.phone} onChange={handleChange} required />
          <input type="date" name="dob" className="border p-2 rounded" value={form.dob} onChange={handleChange} required />
          <select name="age" className="border p-2 rounded" value={form.age} onChange={handleChange} required>
            <option value="">Select Age</option>
            {Array.from({ length: 83 }, (_, i) => <option key={i} value={i + 18}>{i + 18}</option>)}
          </select>
          <select name="gender" className="border p-2 rounded" value={form.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter Password" className="border p-2 rounded w-full" value={form.password} onChange={handleChange} required />
            <span onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 cursor-pointer text-sm text-blue-700">{showPassword ? "Hide" : "Show"}</span>
          </div>
          <input type="password" name="confirmPassword" placeholder="Enter Confirm Password" className="border p-2 rounded" value={form.confirmPassword} onChange={handleChange} required />
          <button type="submit" className="col-span-1 md:col-span-2 bg-blue-800 text-white py-2 rounded mt-2">Sign In</button>
        </form>

        <p className="text-sm text-center mt-4">Already Have An Account? <a href="/login" className="text-blue-600 hover:underline">Login</a></p>
      </div>

      {/* Right side */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-blue-900 text-white p-10 rounded-l-[2rem]">
        <h1 className="text-3xl font-bold mb-4 text-pink-400">Hello<span className="text-white">Doc</span></h1>
        <img src="/login-illustration.png" alt="Doctor" className="w-64 mb-6" />
        <h2 className="text-xl font-semibold mb-2 text-center">Sign In To Your Account</h2>
        <p className="text-sm text-center max-w-sm">Access Virtual Care, Manage Appointments, And Connect With Healthcare Providers — All in One Place.</p>
      </div>
    </div>
  )
}

export default PatientRegister

import { useState } from 'react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Email: ${email}, Password: ${password}`)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Illustration Side */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 to-blue-700 text-white p-10 rounded-3xl shadow-md">
          <h1 className="text-4xl font-bold mb-4 text-pink-400">Hello<span className="text-white">Doc</span></h1>
          <img src="/login-illustration.png" alt="Login" className="w-80 h-auto mb-6" />
          <p className="text-lg font-semibold text-center mb-2">Your Health, Your Way — Anytime, Anywhere.</p>
          <p className="text-sm text-center max-w-md">
            Log in to connect with licensed healthcare providers for secure, convenient care. New here? Sign up to get started on your path to better health.
          </p>
        </div>

        {/* Form Side */}
        <div className="bg-white p-8 shadow-lg rounded-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Login to Your Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded px-4 py-3"
                placeholder="Enter E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border border-gray-300 rounded px-4 py-3"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-[2.5rem] right-3 text-sm text-blue-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="form-checkbox" />
                Remember Me
              </label>
              <a href="#" className="text-blue-600 hover:underline">Forgot Password?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-800 text-white py-3 rounded hover:bg-blue-900 transition"
            >
              Log In
            </button>

            <p className="text-sm text-center mt-4 text-gray-600">
              Don’t have an account?{' '}
              <a href="/patientregister" className="text-blue-600 hover:underline">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login

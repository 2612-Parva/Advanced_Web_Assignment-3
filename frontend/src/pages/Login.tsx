import { useState } from 'react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Email: ${email}, Password: ${password}`)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-10">
        <h1 className="text-2xl font-bold mb-2">Login To Your Account</h1>
        <p className="text-sm text-gray-600 mb-6">Hey! We Soar You Working Welcome Back!</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Remember Me</span>
            </label>
            <a href="#" className="text-blue-600 hover:underline">Forgot Password?</a>
          </div>

          <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-900">
            Log In
          </button>

          <p className="text-sm text-center">
            Don’t Have An Account? <a href="/register" className="text-blue-600 hover:underline">Sign Up</a>
          </p>
        </form>
      </div>

      {/* Right Side */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-blue-900 text-white p-10 rounded-l-[2rem]">
        <h1 className="text-3xl font-bold mb-4 text-pink-400">Hello<span className="text-white">Doc</span></h1>
        <img src="/login-illustration.png" alt="Doctor illustration" className="w-64 mb-6" />
        <p className="text-lg font-semibold mb-2 text-center">
          Your Health, Your Way — Anytime, Anywhere.
        </p>
        <p className="text-sm text-center max-w-sm">
          Log in to connect with licensed healthcare providers for secure, convenient care. New here? Sign up to get started on your path to better health.
        </p>
      </div>
    </div>
  )
}

export default Login

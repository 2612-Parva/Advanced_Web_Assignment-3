import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../redux/hooks';
import { loginSuccess } from '../redux/userSlice';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); 
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [tempToken, setTempToken] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleStepOne = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin' 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.tempToken || !data.question) {
        throw new Error('Invalid response from server');
      }

      setStep(2);
      setSecurityQuestion(data.question);
      setTempToken(data.tempToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepTwo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ securityAnswer }),
        credentials: 'same-origin' 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      if (!data.accessToken || !data.refreshToken || !data.user) {
        throw new Error('Invalid authentication data received');
      }

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      const userData = {
        id: data.user._id || data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
        isVerified: data.user.isVerified
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      dispatch(loginSuccess(userData));

      const redirectPath = data.user.role === 'doctor' 
        ? '/doctor/dashboard' 
        : data.user.role === 'admin' 
          ? '/admin/dashboard' 
          : '/patient/dashboard';
      
      navigate(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 to-blue-700 text-white p-8 rounded-2xl shadow-md">
          <h1 className="text-3xl font-bold mb-3 text-pink-400">Hello<span className="text-white">Doc</span></h1>
          <img src="/login-illustration.png" alt="Login" className="w-56 h-auto mb-4" />
          <p className="text-base font-semibold text-center mb-1">Your Health, Your Way — Anytime, Anywhere.</p>
          <p className="text-xs text-center max-w-md">
            Log in to connect with licensed healthcare providers for secure, convenient care. New here? Sign up to get started on your path to better health.
          </p>
        </div>

        <div className="bg-white p-6 shadow-md rounded-xl">
          <div className="mb-2">
            <Link to="/" className="text-blue-600 text-xs underline hover:text-blue-800">
              ← Back to Home
            </Link>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {step === 1 ? 'Login to Your Account' : 'Answer Security Question'}
          </h2>

          {error && (
            <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-xs">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStepOne} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs pr-6"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 bottom-1 text-xs text-blue-600 px-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="form-checkbox" />
                  Remember Me
                </label>
                <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-800 text-white py-1.5 rounded hover:bg-blue-900 transition flex justify-center items-center ${isLoading ? 'opacity-75' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </>
                ) : 'Continue'}
              </button>

              <p className="text-xs text-center mt-3 text-gray-600">
                Don't have an account?{' '}
                <Link to="/patientregister" className="text-blue-600 hover:underline">Sign Up as Patient</Link>
                {' '}or{' '}
                <Link to="/doctorregister" className="text-blue-600 hover:underline">Doctor</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleStepTwo} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Security Question</label>
                <p className="text-xs bg-gray-100 p-2 rounded">{securityQuestion}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Your Answer</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  placeholder="Enter your answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-800 text-white py-1.5 rounded hover:bg-blue-900 transition flex justify-center items-center ${isLoading ? 'opacity-75' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </>
                ) : 'Complete Login'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-blue-600 text-xs hover:underline mt-2"
              >
                ← Back to email/password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { resetPassword } from '../redux/actions/authActions';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || 'test@example.com'; 

  useEffect(() => {
    if (!email) {
       navigate('/forgot-password');
     }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);

    try {
      await dispatch(resetPassword({ email, newPassword, confirmPassword }) as any);
      navigate('/login', { 
        state: { 
          message: 'Password reset successfully! Please login with your new password.' 
        } 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your new password for{' '}
            <span className="font-medium text-blue-600">{email}</span>
          </p>
        </div>

        <div className="bg-white p-8 shadow-md rounded-xl border">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-8 text-sm text-blue-600"
              >
                {showNewPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-8 text-sm text-blue-600"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="text-xs text-gray-600">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>At least 6 characters long</li>
                <li>Must match confirmation password</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
              className={`w-full bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-900 transition flex justify-center items-center ${
                loading || newPassword.length < 6 || newPassword !== confirmPassword 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </>
              ) : 'Reset Password'}
            </button>

            <div className="flex justify-between text-center text-sm">
              <Link 
                to="/verify-otp"
                className="text-blue-600 hover:underline"
              >
                ← Back to OTP
              </Link>
              <Link 
                to="/login"
                className="text-blue-600 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
import React, { useState } from 'react';
import {
  LayoutGrid,
  Calendar,
  MessageCircle,
  BookOpen,
  Settings,
  LogOut,
  Users,
  FileText,
  Activity
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: <LayoutGrid />, to: '/doctor/dashboard' },
  { label: 'Appointments', icon: <Calendar />, to: '/doctor/appointments' },
  { label: 'Patients', icon: <Users />, to: '/doctor/patients' },
  { label: 'Consultations', icon: <MessageCircle />, to: '/doctor/consultations' },
  { label: 'Reports', icon: <FileText />, to: '/doctor/reports' },
  { label: 'Analytics', icon: <Activity />, to: '/doctor/analytics' },
  { label: 'Settings', icon: <Settings />, to: '/doctor/settings' },
];

const DoctorSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutConfirm = () => {
    // Clear any stored tokens or user data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('selectedDoctor');
    
    setShowConfirm(false);
    navigate('/');
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="h-screen w-20 bg-blue-600 text-white flex flex-col items-center shadow-md fixed top-0 left-0 pt-6 space-y-6 z-40">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              `p-3 rounded-xl hover:bg-blue-500 transition-colors relative group ${
                isActive ? 'bg-white text-blue-600' : ''
              }`
            }
            title={item.label}
          >
            <div className="flex justify-center">{item.icon}</div>
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 top-1/2 transform -translate-y-1/2">
              {item.label}
            </div>
          </NavLink>
        ))}

        <button
          onClick={() => setShowConfirm(true)}
          className="p-3 hover:bg-blue-500 rounded-xl transition-colors relative group"
          title="Logout"
        >
          <LogOut />
          
          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 top-1/2 transform -translate-y-1/2">
            Logout
          </div>
        </button>
      </aside>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Are you sure you want to log out?</h3>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorSidebar;
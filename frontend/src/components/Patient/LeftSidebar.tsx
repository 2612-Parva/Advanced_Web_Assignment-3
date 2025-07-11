import React from 'react';
import {
  LayoutGrid,
  Calendar,
  MessageCircle,
  BookOpen,
  Settings,
  LogOut,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: <LayoutGrid />, to: '/dashboard' },
  { label: 'Appointments', icon: <Calendar />, to: '/appointments' },
  { label: 'Chat', icon: <MessageCircle />, to: '/consultations' },
  { label: 'appointment-booking', icon: <BookOpen />, to: '/book-appointment' },
  { label: 'Settings', icon: <Settings />, to: '/settings' },
];

const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <aside className="h-screen w-20 bg-blue-600 text-white flex flex-col items-center shadow-md fixed top-14 left-0 pt-6 space-y-6">
      {navItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.to}
          className={({ isActive }) =>
            `p-3 rounded-xl hover:bg-blue-500 transition-colors ${
              isActive ? 'bg-white text-blue-600' : ''
            }`
          }
        >
          <div className="flex justify-center">{item.icon}</div>
        </NavLink>
      ))}

      
      <button
        onClick={handleLogout}
        className="p-3 hover:bg-blue-500 rounded-xl transition-colors"
      >
        <LogOut />
      </button>
    </aside>
  );
};

export default LeftSidebar;

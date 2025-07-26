import { useEffect, useState } from 'react';
import { decodeToken } from '../../utils/decodeToken';
import AppointmentList from './AppointmentList';
import ChatBox from './ChatBox';
import ChatHeader from './ChatHeader';
import Sidebar from '../Patient/LeftSidebar';
import TopNavBar from '../Patient/TopNavbar';
import type { AppointmentType, MessageType } from './types';

const ChatLayout = () => {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [activeAppointment, setActiveAppointment] = useState<AppointmentType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);

  const token = localStorage.getItem('accessToken');
  const decoded = decodeToken(token);
  const userId = decoded?.userId;
  const role = decoded?.role;

  if (!userId || !token || !role) {
    return (
      <div className="p-8 text-center text-red-600">
        You must be logged in to access the chat.
      </div>
    );
  }

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAppointments(data.body);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  };

  const fetchMessages = async (appointmentId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/messages/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setMessages(data.body);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (activeAppointment) {
      fetchMessages(activeAppointment._id);
    }
  }, [activeAppointment]);

  useEffect(() => {
    if (!activeAppointment) return;
    const interval = setInterval(() => {
      fetchMessages(activeAppointment._id);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeAppointment]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600 text-white">
        <Sidebar />
      </div>

      {/* Right content */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
        {/* Top navigation */}
        <div className="w-full border-b shadow-sm bg-white">
          <TopNavBar />
        </div>

        {/* Main chat layout */}
        <main className="flex-1 overflow-y-auto p-2">
          <div className="max-w-7xl h-[85vh] mx-auto rounded-xl overflow-hidden shadow-xl bg-white/80 backdrop-blur-md border border-gray-200 flex">
            {/* Appointment list */}
            <AppointmentList
              appointments={appointments}
              active={activeAppointment}
              onSelect={setActiveAppointment}
              userId={userId}
            />

            {/* Chat area */}
            <div className="flex flex-col flex-1 min-w-0">
              <ChatHeader appointment={activeAppointment} userId={userId} />
              <div className="flex-1 flex flex-col overflow-hidden">
                <ChatBox
                  appointment={activeAppointment}
                  messages={messages}
                  setMessages={setMessages}
                  user={{ userId, role, token }}
                  fetchMessages={fetchMessages}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatLayout;

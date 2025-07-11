import React, { useState } from "react";
import TopNavBar from "../components/Patient/TopNavbar";
import SideBar from "../components/Patient/LeftSidebar";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DoctorProfile: React.FC = () => {
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem("selectedDoctor") || "{}");

  const [selectedTime, setSelectedTime] = useState("12:30 PM");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "12:00 PM", "12:30 PM", 
    
  ];

  if (!doctor?.name) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="w-[80px] bg-blue-600 text-white">
          <SideBar />
        </div>
        <div className="flex-1 flex flex-col bg-white">
          <div className="w-full border-b shadow-sm">
            <TopNavBar />
          </div>
          <main className="flex-1 flex items-center justify-center p-6 text-gray-600">
            <div className="text-center">
              <h2 className="text-xl mb-2">No doctor selected.</h2>
              <p className="text-sm">Please go back and select a doctor from the list.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-[80px] bg-blue-600 text-white">
        <SideBar />
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="w-full border-b shadow-sm bg-white">
          <TopNavBar />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Info */}
            <div className="flex items-start gap-6 mb-6">
              <img
                src={doctor.image}
                alt="Doctor Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold mb-1">{doctor.name}</h1>
                <p className="text-gray-600">{doctor.specialty}</p>
                <p className="text-sm text-gray-400">
                  {doctor.clinic}<br />{doctor.experience}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="border rounded-xl text-center p-4">
                <p className="text-blue-500 font-bold text-2xl">1000+</p>
                <p className="text-sm">Patients</p>
              </div>
              <div className="border rounded-xl text-center p-4">
                <p className="text-pink-500 font-bold text-2xl">10 Yrs</p>
                <p className="text-sm">Experience</p>
              </div>
              <div className="border rounded-xl text-center p-4">
                <p className="text-yellow-500 font-bold text-2xl">{doctor.rating}</p>
                <p className="text-sm">Ratings</p>
              </div>
            </div>

            {/* About Doctor */}
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-1">About Doctor</h3>
              <p className="text-sm text-gray-600">
                Dr. {doctor.name.split(" ")[1]} is a highly respected specialist at {doctor.clinic}. Renowned for their dedication and service excellence.
              </p>
            </div>

            {/* Calendar + Time Slots */}
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-3">Schedule Appointment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select Date</label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    className="border px-3 py-2 rounded w-full text-sm focus:outline-blue-500"
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    dayClassName={(date) =>
                      date.toDateString() === selectedDate?.toDateString()
                        ? "custom-selected-day"
                        : ""
                    }
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-medium mb-2">Available Time</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded text-sm border transition-all ${
                          selectedTime === time
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-800 border-gray-300 hover:bg-blue-50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <div className="mt-8 text-center">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => navigate("/confirm-booking")}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorProfile;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorProfile = () => {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(4);
  const [selectedTime, setSelectedTime] = useState('12:30 PM');

  const doctor = JSON.parse(localStorage.getItem("selectedDoctor") || '{}');
  const form = JSON.parse(localStorage.getItem("appointmentForm") || '{}');

  const days = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri'];
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '12:00 PM', '12:30 PM', '01:30 PM', '02:00 AM',
    '03:00 PM', '04:30 PM', '05:00 PM', '05:30 AM',
  ];

  const handleBook = () => {
    const finalAppointment = {
      ...form,
      doctor: doctor.name,
      specialty: doctor.specialty,
      date: `${selectedDate} July 2025`,
      time: selectedTime
    };

    console.log("Final Appointment:", finalAppointment);
    alert(`Appointment booked with ${finalAppointment.doctor} on ${finalAppointment.date} at ${finalAppointment.time}`);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-blue-600">
      <div className="w-16 flex flex-col items-center py-6 space-y-6 bg-blue-600 text-white">
        <i className="fas fa-home" />
        <i className="fas fa-calendar" />
        <i className="fas fa-video" />
        <i className="fas fa-book-open" />
        <i className="fas fa-cog" />
        <i className="fas fa-file" />
      </div>

      <div className="flex-1 bg-white rounded-l-3xl shadow-lg p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{doctor.name}</h2>
            <p className="text-sm text-gray-600">{doctor.specialty}</p>
            <p className="text-xs text-gray-500">{doctor.clinic}</p>
          </div>
          <div className="flex items-center space-x-4">
            <i className="fas fa-bell text-gray-500" />
            <div className="flex items-center space-x-2">
              <img src="https://ui-avatars.com/api/?name=Alan" className="w-8 h-8 rounded-full" />
              <span className="text-sm">Alan</span>
            </div>
          </div>
        </div>

        <img src={doctor.image} alt={doctor.name} className="w-14 h-14 rounded-full mb-4" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="border p-4 rounded-xl text-center">
            <p className="text-2xl text-blue-600 font-bold">{doctor.patients || '1000+'}</p>
            <p className="text-sm text-gray-500">Patients</p>
          </div>
          <div className="border p-4 rounded-xl text-center">
            <p className="text-2xl text-pink-600 font-bold">10 Yrs</p>
            <p className="text-sm text-gray-500">Experience</p>
          </div>
          <div className="border p-4 rounded-xl text-center">
            <p className="text-2xl text-yellow-600 font-bold">{doctor.rating || '4.5'}</p>
            <p className="text-sm text-gray-500">Ratings</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">About Doctor</h3>
          <p className="text-sm text-gray-600">{doctor.description}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">July, 2025</h4>
          <div className="flex space-x-3">
            {[3, 4, 5, 6, 7].map((date, idx) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  selectedDate === date
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                <div className="text-xs">{days[idx]}</div>
                <div className="font-bold text-sm">{date}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Available Time</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedTime(slot)}
                className={`px-4 py-2 border rounded text-sm ${
                  selectedTime === slot
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleBook}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AppointmentBooking() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    postalCode: '',
    address: 'Auto fill',
    date: '',
    healthCard: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setForm({
      firstName: '',
      lastName: '',
      postalCode: '',
      address: 'Auto fill',
      date: '',
      healthCard: '',
      description: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("appointmentForm", JSON.stringify(form));
    navigate('/select-doctor');
  };

  return (
    <div className="min-h-screen flex bg-blue-600">
      <div className="w-16 flex flex-col items-center py-6 space-y-6 bg-blue-600 text-white">
        <i className="fas fa-home"></i>
        <i className="fas fa-calendar"></i>
        <i className="fas fa-video"></i>
        <i className="fas fa-book-open"></i>
        <i className="fas fa-cog"></i>
        <i className="fas fa-file"></i>
      </div>

      <div className="flex-1 bg-white rounded-l-3xl shadow-lg p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Appointment Booking</h2>
          <div className="flex items-center space-x-4">
            <i className="fas fa-bell text-gray-500"></i>
            <div className="flex items-center space-x-2">
              <img src="/profile.png" alt="User" className="w-8 h-8 rounded-full" />
              <span className="text-sm">Alan</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
          {[
            { label: "First Name", name: "firstName" },
            { label: "Last Name", name: "lastName" },
            { label: "Health Card Number", name: "healthCard" },
            { label: "Description for appointment", name: "description" },
          ].map(({ label, name }) => (
            <div key={name}>
              <label className="block text-sm mb-1">{label}</label>
              <input
                name={name}
                type="text"
                value={form[name]}
                onChange={handleChange}
                placeholder="Type here"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm mb-1">Postal Code</label>
            <select
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Dropdown option</option>
              <option value="H1A">H1A</option>
              <option value="H1B">H1B</option>
              <option value="H1C">H1C</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              disabled
              className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Date (DDMMYYYY)</label>
            <input
              type="text"
              name="date"
              value={form.date}
              onChange={handleChange}
              placeholder="04062025"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-2 border border-purple-400 text-purple-600 rounded hover:bg-purple-50 text-sm"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentBooking;

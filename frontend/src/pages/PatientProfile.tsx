import React, { useState } from 'react';
import { Mail, Phone, Edit3, Save, X, MapPin } from 'lucide-react';
import TopNavBar from '../components/Patient/TopNavbar';
import LeftSidebar from '../components/Patient/LeftSidebar';

const PatientProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [patient, setPatient] = useState({
    name: 'Alan Levis',
    gender: 'Male',
    age: 32,
    email: 'Alenlevis@gmail.com',
    phone: '+880 17252412323',
    image: 'https://ui-avatars.com/api/?name=Alan',
    address: '123 Medical Plaza, India'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully.');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600 text-white">
        <LeftSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top Navbar */}
        <div className="w-full border-b shadow-sm bg-white">
          <TopNavBar />
        </div>

        {/* Profile Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={patient.image}
                    alt="Patient"
                    className="w-16 h-16 rounded-full object-cover shadow-sm"
                  />
                  <div>
                    {isEditing ? (
                      <>
                        <input
                          name="name"
                          value={patient.name}
                          onChange={handleChange}
                          className="text-xl font-bold border rounded px-3 py-2 w-full mb-2"
                          placeholder="Full Name"
                        />
                        <div className="flex gap-2">
                          <select
                            name="gender"
                            value={patient.gender}
                            onChange={handleChange}
                            className="border rounded px-3 py-2"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          <input
                            name="age"
                            type="number"
                            value={patient.age}
                            onChange={handleChange}
                            className="border rounded px-3 py-2"
                            placeholder="Age"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold">{patient.name}</h2>
                        <p className="text-gray-500">{patient.gender} • {patient.age} years old</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition ${
                    isEditing
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {/* Contact Details */}
              <div className="space-y-4 mt-4">
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {isEditing ? (
                      <input
                        name="email"
                        value={patient.email}
                        onChange={handleChange}
                        className="flex-1 border rounded px-3 py-2"
                      />
                    ) : (
                      <span className="text-gray-700">{patient.email}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {isEditing ? (
                      <input
                        name="phone"
                        value={patient.phone}
                        onChange={handleChange}
                        className="flex-1 border rounded px-3 py-2"
                      />
                    ) : (
                      <span className="text-gray-700">{patient.phone}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {isEditing ? (
                      <input
                        name="address"
                        value={patient.address}
                        onChange={handleChange}
                        className="flex-1 border rounded px-3 py-2"
                      />
                    ) : (
                      <span className="text-gray-700">{patient.address}</span>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <button
                    onClick={handleSave}
                    className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    <Save className="w-4 h-4 inline-block mr-2" />
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientProfile;

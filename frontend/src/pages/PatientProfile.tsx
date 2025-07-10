import React, { useState } from 'react';

const PatientProfile: React.FC = () => {
  const [tab, setTab] = useState('Overview');

  const patient = {
    name: 'Marvin McKinney',
    gender: 'Male',
    age: 32,
    condition: 'Brain, Spinal Cord, and Nerve Disorders',
    email: 'marmckinder@gmail.com',
    phone: '+880 17252412323',
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  };

  const vitals = {
    glucose: '120 mg/dt',
    weight: '55 Kg',
    heartRate: '70 bpm',
    oxygen: '71%',
    temperature: '98.1 F',
    bp: '120/80 mm hg'
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-16 bg-blue-600 text-white flex flex-col items-center py-6 space-y-6">
        <i className="fas fa-table-cells-large" />
        <i className="fas fa-calendar-check" />
        <i className="fas fa-user-md" />
        <i className="fas fa-notes-medical" />
        <i className="fas fa-gear" />
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <select className="bg-white border px-3 py-1 rounded shadow-sm">
              <option>Alan Murphy</option>
              <option>Jessica Lee</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-blue-600 text-white px-4 py-1 rounded">+ Add Patient</button>
            <button className="border px-3 py-1 rounded">Filter</button>
            <div className="flex items-center gap-2">
              <img src="https://randomuser.me/api/portraits/men/5.jpg" className="w-8 h-8 rounded-full" />
              <span className="text-sm">Dr. Kim</span>
            </div>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="border rounded-xl p-4 shadow-sm mb-4">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <img src={patient.image} className="w-16 h-16 rounded-full" />
              <div>
                <h3 className="text-lg font-semibold">{patient.name}</h3>
                <p className="text-sm text-gray-500">{`${patient.gender} · Age ${patient.age}`}</p>
                <p className="text-sm text-gray-600">{patient.condition}</p>
                <p className="text-sm text-gray-600">{patient.email}</p>
                <p className="text-sm text-gray-600">{patient.phone}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <button className="text-blue-600 border px-3 py-1 rounded text-sm">Edit</button>
              <button className="text-red-500 bg-red-100 px-3 py-1 rounded text-sm">Remove Patient</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b mt-4 pt-2 text-sm font-medium text-gray-500">
            {['Overview', 'Appointment History', 'Medical Record', 'Medication'].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`pb-2 ${tab === item ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Overview Section */}
          {tab === 'Overview' && (
            <div className="mt-4 space-y-4">
              {/* Vitals */}
              <div className="border p-4 rounded-xl">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Vitals</h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>{vitals.glucose}<br /><span className="text-gray-500">Blood glucose level</span></div>
                  <div>{vitals.weight}<br /><span className="text-gray-500">Weight</span></div>
                  <div>{vitals.heartRate}<br /><span className="text-gray-500">Heart rate</span></div>
                  <div>{vitals.oxygen}<br /><span className="text-gray-500">Oxygen saturation</span></div>
                  <div>{vitals.temperature}<br /><span className="text-gray-500">Body temperature</span></div>
                  <div>{vitals.bp}<br /><span className="text-gray-500">Blood pressure</span></div>
                </div>
              </div>

              {/* Medications */}
              <div className="border p-4 rounded-xl">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Medications</h4>
                <div className="text-sm">
                  <p><strong>Ursofalk 300</strong> – Routine Medicine <br /><span className="text-gray-500">2 Pills · 02:00 PM · No observations</span></p>
                  <p className="mt-3"><strong>Indever 20</strong> – Emergency <br /><span className="text-gray-500">1 Pill · 02:20 PM · Given for seizures</span></p>
                </div>
              </div>

              {/* Test Reports */}
              <div className="border p-4 rounded-xl">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Test Reports</h4>
                <div className="text-sm">
                  <p><strong>UV Invasive Ultrasound</strong> – Nerve Disorder<br /><span className="text-gray-500">A small nerve in the left-mid neck section is swollen. Brain scan suggested.</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientProfile;

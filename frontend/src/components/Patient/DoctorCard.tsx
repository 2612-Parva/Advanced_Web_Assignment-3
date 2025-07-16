import React from 'react';

export interface Doctor {
  name: string;
  specialty: string;
  clinic: string;
  experience: string;
  rating: string;
  reviews: number;
  nextAvailable: string;
  image: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onSchedule: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSchedule }) => {
  return (
    <div className="border rounded-xl p-4 shadow-md bg-white flex flex-col justify-between">
      <div className="flex items-center space-x-3 mb-3">
        <img src={doctor.image} alt={doctor.name} className="w-12 h-12 rounded-full" />
        <div>
          <h3 className="text-sm font-semibold">{doctor.name}</h3>
          <p className="text-xs text-gray-600">{doctor.specialty}</p>
          <p className="text-xs text-gray-500">{doctor.clinic}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1">{doctor.experience}</p>
      <p className="text-xs mb-1">⭐ {doctor.rating} ({doctor.reviews} Reviews)</p>
      <p className="text-xs text-green-600 mb-3">Next Available: {doctor.nextAvailable}</p>
      <div className="flex justify-between items-center">
        <a href="/doctor-profile" className="text-xs text-blue-600 underline">View Profile</a>
        <button
          onClick={() => onSchedule(doctor)}
          className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
        >
          Schedule Appointment
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;

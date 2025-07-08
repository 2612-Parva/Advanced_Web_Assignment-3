import { useNavigate } from 'react-router-dom';
import DoctorCard, { type Doctor } from '../components/DoctorCard';

const DoctorSelection = () => {
  const navigate = useNavigate();

  const doctors: Doctor[] = [
    {
      name: 'Dr. Emily Johnson',
      specialty: 'Dermatology Specialist',
      clinic: 'Sunrise Medical Clinic, Seattle, WA',
      experience: '10+ years of experience',
      rating: '4.7/5',
      reviews: 150,
      nextAvailable: 'Tomorrow, 2:00 PM',
      image: 'https://ui-avatars.com/api/?name=Emily+Johnson'
    },
    {
      name: 'Dr. Michael Lee',
      specialty: 'Cardiologist',
      clinic: 'Heart Health Clinic, San Francisco, CA',
      experience: '30+ years of experience',
      rating: '4.8/5',
      reviews: 510,
      nextAvailable: 'Mon, Aug 29, 10:00 AM',
      image: 'https://ui-avatars.com/api/?name=Michael+Lee'
    },
    {
      name: 'Dr. Sarah Thompson',
      specialty: 'Pediatrician',
      clinic: 'Bright Future Pediatrics, Austin, TX',
      experience: '15+ years of experience',
      rating: '4.9/5',
      reviews: 320,
      nextAvailable: 'Wed, Aug 31, 10:00 PM',
      image: 'https://ui-avatars.com/api/?name=Sarah+Thompson'
    }
  ];

  const handleSchedule = (doctor: Doctor) => {
    localStorage.setItem("selectedDoctor", JSON.stringify(doctor));
    navigate('/doctor-profile');
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
          <h2 className="text-xl font-semibold">All the available doctors near you</h2>
          <div className="flex items-center space-x-4">
            <i className="fas fa-bell text-gray-500"></i>
            <div className="flex items-center space-x-2">
              <img src="https://ui-avatars.com/api/?name=Alan" className="w-8 h-8 rounded-full" />
              <span className="text-sm">Alan</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc, i) => (
            <DoctorCard key={i} doctor={doc} onSchedule={handleSchedule} />
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate('/book-appointment')}
            className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorSelection;

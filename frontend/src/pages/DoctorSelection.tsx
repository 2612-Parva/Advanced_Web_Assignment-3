import { useNavigate } from 'react-router-dom';
import DoctorCard, { type Doctor } from '../components/Patient/DoctorCard';
import Sidebar from '../components/Patient/LeftSidebar';
import TopNavBar from '../components/Patient/TopNavbar';

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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600 text-white">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* TopNavBar */}
        <div className="w-full border-b shadow-sm">
          <TopNavBar />
        </div>

        {/* Doctor List */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">
              All the available doctors near you
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc, i) => (
                <DoctorCard key={i} doctor={doc} onSchedule={handleSchedule} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => navigate('/book-appointment')}
                className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm"
              >
                Back
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorSelection;

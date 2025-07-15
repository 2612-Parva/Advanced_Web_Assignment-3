import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Patient/LeftSidebar";
import TopNavBar from "../components/Patient/TopNavbar";
import { usePlaceAutocomplete } from "../hooks/usePlaceAutocomplete";

interface AppointmentForm {
  firstName: string;
  lastName: string;
  postalCode: string;
  address: string;
  date: string;
  healthCard: string;
  description: string;
}

const AppointmentBooking: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<AppointmentForm>({
    firstName: "",
    lastName: "",
    postalCode: "",
    address: "",
    date: "",
    healthCard: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setForm({
      firstName: "",
      lastName: "",
      postalCode: "",
      address: "",
      date: "",
      healthCard: "",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("appointmentForm", JSON.stringify(form));
    navigate("/select-doctor");
  };

  usePlaceAutocomplete("autocomplete-address", (selectedAddress) => {
    setForm((prev) => ({ ...prev, address: selectedAddress }));
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[80px] bg-blue-600 text-white">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* TopNav */}
        <div className="w-full border-b shadow-sm">
          <TopNavBar />
        </div>

        {/* Form Content */}
        <main className="flex-1 overflow-y-auto p-2 md:p-2">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Appointment Booking</h2>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-2">
                {(
                  [
                    { label: "First Name", name: "firstName" },
                    { label: "Last Name", name: "lastName" },
                    { label: "Health Card Number", name: "healthCard" },
                    {
                      label: "Description for appointment",
                      name: "description",
                    },
                  ] as const
                ).map(({ label, name }) => (
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
                    id="autocomplete-address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Start typing your address..."
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Date (DD/MM/YYYY)</label>
                  <input
                    type="text"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    placeholder="04/06/2025"
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex justify-between mt-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-6 py-2 border border-blue-400 text-blue-600 rounded hover:bg-blue-50 text-sm"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Next
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppointmentBooking;

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';


const PatientCalendar: React.FC = () => {
  const handleDateClick = (arg: DateClickArg) => {
    alert(`You clicked on date: ${arg.dateStr}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">My Appointment Calendar</h1>

        <div className="bg-white shadow rounded-lg overflow-hidden p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            height="auto"
            dateClick={handleDateClick}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientCalendar;

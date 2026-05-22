import React, { useState } from "react";

const mockDoctors = [
  { id: 1, name: "Dr. A", speciality: "Orthopedic" },
  { id: 2, name: "Dr. B", speciality: "Cardiologist" },
  { id: 3, name: "Dr. C", speciality: "Dermatologist" },
];

const initialAvailability = {
  1: [
    { date: "2026-05-10", slots: ["09:00", "10:00", "11:00"] },
    { date: "2026-05-12", slots: ["14:00", "15:00"] },
  ],
  2: [
    { date: "2026-05-11", slots: ["10:00", "11:00"] },
  ],
  3: [],
};

export default function DoctorAvailability() {
  const [selectedDoctor, setSelectedDoctor] = useState(mockDoctors[0].id);
  const [availability, setAvailability] = useState(initialAvailability);
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("");

  const handleAddSlot = () => {
    if (!newDate || !newSlot) return;
    setAvailability(prev => {
      const doctorAvail = prev[selectedDoctor] || [];
      let dateObj = doctorAvail.find(d => d.date === newDate);
      if (dateObj) {
        dateObj.slots.push(newSlot);
      } else {
        doctorAvail.push({ date: newDate, slots: [newSlot] });
      }
      return { ...prev, [selectedDoctor]: [...doctorAvail] };
    });
    setNewSlot("");
  };

  const handleRemoveSlot = (date, slot) => {
    setAvailability(prev => {
      let doctorAvail = prev[selectedDoctor].map(d => ({ ...d }));
      let dateObj = doctorAvail.find(d => d.date === date);
      if (dateObj) {
        dateObj.slots = dateObj.slots.filter(s => s !== slot);
      }
      return { ...prev, [selectedDoctor]: doctorAvail };
    });
  };

  const handleBlockDate = (date) => {
    setAvailability(prev => {
      let doctorAvail = prev[selectedDoctor].filter(d => d.date !== date);
      return { ...prev, [selectedDoctor]: doctorAvail };
    });
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xl font-semibold mb-2">Doctor Availability Calendar</div>
          <select
            className="border rounded px-3 py-2 w-64"
            value={selectedDoctor}
            onChange={e => setSelectedDoctor(Number(e.target.value))}
          >
            {mockDoctors.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name} ({doc.speciality})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center mt-4 md:mt-0">
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
          />
          <input
            type="time"
            className="border rounded px-3 py-2"
            value={newSlot}
            onChange={e => setNewSlot(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleAddSlot}
          >Add Slot</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-lg font-semibold mb-4">Availability</div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Slots</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(availability[selectedDoctor] || []).map((d, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-3">{d.date}</td>
                  <td className="p-3">
                    {d.slots.map(slot => (
                      <span key={slot} className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-1 mr-2 mb-1">
                        {slot}
                        <button className="ml-2 text-red-500" onClick={() => handleRemoveSlot(d.date, slot)}>&times;</button>
                      </span>
                    ))}
                  </td>
                  <td className="p-3">
                    <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleBlockDate(d.date)}>Block Date</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";

const mockAppointments = [
  { id: 1, patient: "John Doe", doctor: "Dr. A", date: "2026-05-10", time: "09:00", isVideo: true, meetingLink: "https://meet.example.com/abc", status: "Scheduled" },
  { id: 2, patient: "Jane Smith", doctor: "Dr. B", date: "2026-05-11", time: "11:00", isVideo: false, meetingLink: "", status: "Completed" },
  { id: 3, patient: "Alex Roy", doctor: "Dr. C", date: "2026-05-12", time: "14:00", isVideo: true, meetingLink: "https://meet.example.com/xyz", status: "Cancelled" },
];

export default function VideoConsultations() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [editId, setEditId] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");

  const handleEdit = (id, link) => {
    setEditId(id);
    setMeetingLink(link);
  };

  const handleSave = (id) => {
    setAppointments(appts => appts.map(a => a.id === id ? { ...a, meetingLink } : a));
    setEditId(null);
    setMeetingLink("");
  };

  const handleCancel = (id) => {
    setAppointments(appts => appts.map(a => a.id === id ? { ...a, status: "Cancelled" } : a));
  };

  const handleReschedule = (id) => {
    setAppointments(appts => appts.map(a => a.id === id ? { ...a, status: "Scheduled" } : a));
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="text-xl font-semibold mb-2">Video Consultations</div>
        <div className="text-gray-500 mb-4">Manage meeting links, assign doctors, and schedule/cancel video appointments.</div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-lg font-semibold mb-4">Appointments</div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Doctor</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Video Call</th>
                <th className="p-3 text-left">Meeting Link</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id} className="border-t">
                  <td className="p-3">{a.patient}</td>
                  <td className="p-3">{a.doctor}</td>
                  <td className="p-3">{a.date}</td>
                  <td className="p-3">{a.time}</td>
                  <td className="p-3">{a.isVideo ? <span className="text-blue-600 font-bold">Yes</span> : "No"}</td>
                  <td className="p-3">
                    {editId === a.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-48"
                          value={meetingLink}
                          onChange={e => setMeetingLink(e.target.value)}
                        />
                        <button className="bg-green-500 text-white px-2 rounded" onClick={() => handleSave(a.id)}>Save</button>
                        <button className="bg-gray-300 text-black px-2 rounded" onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        {a.meetingLink ? (
                          <a href={a.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Link</a>
                        ) : (
                          <span className="text-gray-400">No Link</span>
                        )}
                        <button className="bg-blue-500 text-white px-2 rounded" onClick={() => handleEdit(a.id, a.meetingLink)}>Edit</button>
                      </div>
                    )}
                  </td>
                  <td className={`p-3 ${a.status === "Scheduled" ? "text-blue-600" : a.status === "Completed" ? "text-green-600" : "text-red-600"}`}>{a.status}</td>
                  <td className="p-3 flex gap-2">
                    {a.status !== "Cancelled" && (
                      <button className="bg-red-500 text-white px-2 rounded" onClick={() => handleCancel(a.id)}>Cancel</button>
                    )}
                    {a.status === "Cancelled" && (
                      <button className="bg-yellow-500 text-white px-2 rounded" onClick={() => handleReschedule(a.id)}>Reschedule</button>
                    )}
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

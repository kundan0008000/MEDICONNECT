import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const mockAppointments = [
  { id: 1, doctor: "Dr. Padma Jignesh", speciality: "Orthopedic", date: "Wed Jun 20", time: "8:00 - 8:30 AM", status: "Upcoming" },
  { id: 2, doctor: "Dr. Sakshi Sinha", speciality: "Obstetrician", date: "Thu Jun 21", time: "8:00 - 8:30 AM", status: "Upcoming" },
  { id: 3, doctor: "Dr. Aaron Leigh", speciality: "Dermatologist", date: "Thu Jun 21", time: "8:00 - 8:30 AM", status: "Past" },
];

export default function Home() {
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const navigate = useNavigate();
  const { userData, doctors } = useContext(AppContext);

  // Ambulance booking form state
  const [ambulanceForm, setAmbulanceForm] = useState({ name: "", location: "", contact: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleAmbulanceSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    addAmbulanceRequest(ambulanceForm);
    setTimeout(() => {
      setShowAmbulanceModal(false);
      setSubmitted(false);
      setAmbulanceForm({ name: "", location: "", contact: "" });
    }, 1500);
  };

  const { addAmbulanceRequest } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-10 px-4 flex flex-col items-center">
      {/* Welcome Card - Professional Header */}
      <div className="w-full max-w-4xl bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row items-center justify-between mb-10 transform hover:shadow-3xl transition">
        <div className='flex-1'>
          <div className="text-4xl md:text-5xl font-bold mb-3">Welcome, {userData?.name || "Guest"}! 👋</div>
          <div className="text-blue-100 text-lg mb-6">Your health is our priority. Let's take care of you today.</div>
          <div className="flex gap-4 flex-wrap">
            <button 
              onClick={() => navigate('/doctors')} 
              className="bg-orange-500 hover:bg-orange-600 transition text-white px-6 py-3 rounded-full font-bold shadow-lg"
            >
              🏥 Book Appointment
            </button>
            <button 
              onClick={() => navigate('/medicines')}
              className="bg-white hover:bg-blue-50 transition text-blue-600 px-6 py-3 rounded-full font-bold shadow-lg"
            >
              💊 Order Medicines
            </button>
          </div>
        </div>
        <div className="mt-6 md:mt-0 md:ml-8">
          <img src="https://cdn-icons-png.flaticon.com/512/387/387561.png" alt="Doctor" className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg" />
        </div>
      </div>

      {/* Quick Services */}
      <div className="w-full max-w-4xl mb-10">
        <h2 className='text-3xl font-bold text-gray-800 mb-8'>Quick Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate('/doctors')}
            className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition p-6 text-center group"
          >
            <span className="bg-blue-100 group-hover:bg-blue-200 p-4 rounded-full mb-3 inline-block text-3xl transition">📅</span>
            <p className="font-bold text-gray-800">Consultation</p>
            <p className="text-gray-600 text-sm mt-2">Book a doctor</p>
          </button>
          <button
            onClick={() => navigate('/medicines')}
            className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition p-6 text-center group"
          >
            <span className="bg-green-100 group-hover:bg-green-200 p-4 rounded-full mb-3 inline-block text-3xl transition">💊</span>
            <p className="font-bold text-gray-800">Medicines</p>
            <p className="text-gray-600 text-sm mt-2">Online pharmacy</p>
          </button>
          <button
            onClick={() => setShowAmbulanceModal(true)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition p-6 text-center group"
          >
            <span className="bg-red-100 group-hover:bg-red-200 p-4 rounded-full mb-3 inline-block text-3xl transition">🚑</span>
            <p className="font-bold text-gray-800">Ambulance</p>
            <p className="text-gray-600 text-sm mt-2">Emergency service</p>
          </button>
          <button
            onClick={() => navigate('/prescription')}
            className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition p-6 text-center group"
          >
            <span className="bg-purple-100 group-hover:bg-purple-200 p-4 rounded-full mb-3 inline-block text-3xl transition">📋</span>
            <p className="font-bold text-gray-800">Prescriptions</p>
            <p className="text-gray-600 text-sm mt-2">QR Prescriptions</p>
          </button>
        </div>
      </div>

      {/* Ambulance Booking Modal */}
      {showAmbulanceModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-red-500" onClick={() => setShowAmbulanceModal(false)}>&times;</button>
            <div className="text-xl font-bold mb-4 text-blue-800">Book an Ambulance</div>
            {submitted ? (
              <div className="text-green-600 font-semibold text-center py-8">Request Submitted!<br/>Help is on the way.</div>
            ) : (
              <form onSubmit={handleAmbulanceSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  className="border rounded px-3 py-2"
                  placeholder="Your Name"
                  value={ambulanceForm.name}
                  onChange={e => setAmbulanceForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  type="text"
                  className="border rounded px-3 py-2"
                  placeholder="Location"
                  value={ambulanceForm.location}
                  onChange={e => setAmbulanceForm(f => ({ ...f, location: e.target.value }))}
                  required
                />
                <input
                  type="tel"
                  className="border rounded px-3 py-2"
                  placeholder="Contact Number"
                  value={ambulanceForm.contact}
                  onChange={e => setAmbulanceForm(f => ({ ...f, contact: e.target.value }))}
                  required
                />
                <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold mt-2" type="submit">Book Ambulance</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Featured Doctors Section */}
      <div className="w-full max-w-4xl mb-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className='text-3xl font-bold text-gray-800'>👨‍⚕️ Featured Doctors</h2>
          <button 
            onClick={() => navigate('/doctors')} 
            className="text-blue-600 hover:text-blue-700 font-semibold transition hover:underline"
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors && doctors.slice(0, 4).map(doctor => (
            <div 
              key={doctor._id} 
              className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition overflow-hidden cursor-pointer group"
              onClick={() => navigate(`/appointment/${doctor._id}`)}
            >
              <div className="relative overflow-hidden h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="text-7xl">👨‍⚕️</div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800">{doctor.name || 'Dr. Unknown'}</h3>
                <p className="text-blue-600 font-semibold text-sm">{doctor.speciality || 'General'}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm text-gray-600">{doctor.experience || 0}+ years</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/appointment/${doctor._id}`);
                  }}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition text-sm"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">📋 Upcoming Appointments</h2>
          <button 
            onClick={() => navigate('/my-appointments')} 
            className="text-blue-600 hover:text-blue-700 font-semibold transition hover:underline"
          >
            View All →
          </button>
        </div>
        {mockAppointments.filter(a => a.status === "Upcoming").length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <p className="mb-4">No upcoming appointments. 📅</p>
            <button 
              onClick={() => navigate('/doctors')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {mockAppointments.filter(a => a.status === "Upcoming").map(a => (
              <div key={a.id} className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent rounded-xl p-5 hover:shadow-md transition border border-blue-100">
                <div className="flex items-center gap-4 flex-1">
                  <img src="https://cdn-icons-png.flaticon.com/512/387/387561.png" alt="Doctor" className="w-16 h-16 rounded-full object-cover border-2 border-blue-200" />
                  <div>
                    <div className="font-bold text-lg text-gray-800">{a.doctor}</div>
                    <div className="text-blue-600 font-semibold">{a.speciality}</div>
                    <div className="text-gray-600 text-sm">📅 {a.date} • 🕐 {a.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">{a.status}</span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm">
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="w-full max-w-4xl mt-12">
        <h2 className='text-3xl font-bold text-gray-800 mb-8'>Why Choose MediConnect?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-t-4 border-blue-500">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-lg text-gray-800 mb-3">Quick Booking</h3>
            <p className="text-gray-600">Book appointments in seconds with our streamlined interface.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-t-4 border-green-500">
            <div className="text-3xl mb-3">🏥</div>
            <h3 className="font-bold text-lg text-gray-800 mb-3">Expert Doctors</h3>
            <p className="text-gray-600">Access verified healthcare professionals in your area.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-t-4 border-purple-500">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold text-lg text-gray-800 mb-3">Affordable Care</h3>
            <p className="text-gray-600">Quality healthcare at transparent and competitive prices.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
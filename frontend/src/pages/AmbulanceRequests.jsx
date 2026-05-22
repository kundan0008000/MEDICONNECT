import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const AmbulanceRequests = () => {
  const { backendUrl, token, userData } = useContext(AppContext);
  const [requests, setRequests] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    location: "",
    contactNumber: "",
    description: "",
  });

  // Fetch user's ambulance requests
  const fetchRequests = async () => {
    try {
      if (!token || !userData) return;
      
      const { data } = await axios.post(
        `${backendUrl}/api/ambulance/get-requests`,
        { userId: userData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    }
  }, [token, backendUrl, userData]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit ambulance request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.patientName ||
      !formData.location ||
      !formData.contactNumber ||
      !formData.description
    ) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/ambulance/request`,
        {
          userId: userData._id,
          patientName: formData.patientName,
          location: formData.location,
          contactNumber: formData.contactNumber,
          description: formData.description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Ambulance requested successfully!");
        setFormData({
          patientName: "",
          location: "",
          contactNumber: "",
          description: "",
        });
        setFormOpen(false);
        fetchRequests();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Cancel request
  const handleCancel = async (ambulanceId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/ambulance/cancel-request`,
        { ambulanceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Request cancelled");
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Login Required
          </h2>
          <p className="text-gray-600">
            Please log in to request an ambulance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🚑 Ambulance Services</h1>
          <p className="text-red-100">Quick ambulance assistance when you need it</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Request Ambulance Button */}
        <div className="mb-8">
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2"
          >
            {formOpen ? "✕ Close Form" : "🚑 Request Ambulance"}
          </button>
        </div>

        {/* Request Form */}
        {formOpen && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Request Ambulance
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Patient Name */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    placeholder="Enter patient name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter patient location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Medical Description / Emergency Details
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the medical condition or emergency..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition flex-1"
                >
                  {loading ? "Requesting..." : "🚑 Request Now"}
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-8 py-3 rounded-lg font-semibold transition flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Your Ambulance Requests
          </h2>

          {requests.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500 text-lg">
                No ambulance requests yet. Request one when needed!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {request.patientName}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        📅 {formatDate(request.requestDate)}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">📍 Location</p>
                      <p className="font-semibold text-gray-800">
                        {request.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">📞 Contact</p>
                      <p className="font-semibold text-gray-800">
                        {request.contactNumber}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-600 text-sm">📝 Details</p>
                    <p className="text-gray-800">{request.description}</p>
                  </div>

                  {request.status === "pending" && (
                    <button
                      onClick={() => handleCancel(request._id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold transition"
                    >
                      Cancel Request
                    </button>
                  )}

                  {request.status === "accepted" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 font-semibold">
                        ✓ Ambulance Accepted - ETA: {request.estimatedTime}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmbulanceRequests;

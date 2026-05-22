import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const QRPrescription = () => {
  const { backendUrl } = useContext(AppContext);
  const [formData, setFormData] = useState({
    patientName: "",
    doctorName: "",
    medicines: [{ name: "", dosage: "" }],
    date: new Date().toISOString().split("T")[0],
  });

  const [qrCode, setQrCode] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle medicine changes
  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index][field] = value;
    setFormData({ ...formData, medicines: newMedicines });
  };

  // Add medicine field
  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: "", dosage: "" }],
    });
  };

  // Remove medicine field
  const removeMedicine = (index) => {
    if (formData.medicines.length > 1) {
      const newMedicines = formData.medicines.filter((_, i) => i !== index);
      setFormData({ ...formData, medicines: newMedicines });
    }
  };

  // Generate QR Code
  const generateQR = async (e) => {
    e.preventDefault();

    if (!formData.patientName || formData.medicines.some((m) => !m.name)) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/qr/generate-qr`, {
        patientName: formData.patientName,
        doctorName: formData.doctorName || "Dr. MediConnect",
        medicines: formData.medicines,
        date: formData.date,
      });

      if (data.success) {
        setQrCode(data.qr);
        setPrescriptionText(data.prescriptionData);
        setShowForm(false);
        toast.success("QR Code generated successfully!");
      }
    } catch (error) {
      toast.error("Failed to generate QR Code");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Download QR Code
  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `prescription_${formData.patientName}_${Date.now()}.png`;
    link.click();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      patientName: "",
      doctorName: "",
      medicines: [{ name: "", dosage: "" }],
      date: new Date().toISOString().split("T")[0],
    });
    setQrCode(null);
    setPrescriptionText(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">📋 QR Code Prescription</h1>
          <p className="text-purple-100">
            Generate secure, digital prescriptions with QR codes
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Form Section */}
        {showForm ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Create Prescription
            </h2>

            <form onSubmit={generateQR} className="space-y-6">
              {/* Patient Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Doctor Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Doctor Name (Optional)
                </label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  placeholder="Enter doctor name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Medicines Section */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Medicines * (Add at least one)
                </label>

                <div className="space-y-3">
                  {formData.medicines.map((medicine, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-end bg-gray-50 p-4 rounded-lg"
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Medicine name"
                          value={medicine.name}
                          onChange={(e) =>
                            handleMedicineChange(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>

                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Dosage (e.g., 500mg, 2 tablets)"
                          value={medicine.dosage}
                          onChange={(e) =>
                            handleMedicineChange(index, "dosage", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {formData.medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicine(index)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addMedicine}
                  className="mt-3 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
                >
                  + Add Medicine
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  {loading ? "Generating..." : "📱 Generate QR Code"}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* QR Code Display Section */}
        {qrCode && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              ✅ QR Code Generated Successfully!
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-6 rounded-lg border-2 border-purple-300">
                  <img
                    src={qrCode}
                    alt="Prescription QR Code"
                    className="w-full max-w-xs"
                  />
                </div>
                <p className="mt-4 text-gray-600 text-sm">
                  Scan this QR code to view prescription details
                </p>
              </div>

              {/* Prescription Details */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Prescription Details
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 whitespace-pre-wrap text-sm font-mono text-gray-700 max-h-96 overflow-y-auto">
                  {prescriptionText}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={downloadQR}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                💾 Download QR Code
              </button>

              <button
                onClick={resetForm}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Create New Prescription
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-purple-50 border-l-4 border-purple-500 p-4">
              <p className="text-gray-700">
                <strong>💡 Tip:</strong> This QR code contains prescription details. Patients can scan it to view medicines and dosage. Perfect for digital health records and pharmacy systems.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPrescription;

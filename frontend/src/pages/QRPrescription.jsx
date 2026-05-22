import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const QRPrescription = () => {
  const { backendUrl } = useContext(AppContext);
  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    doctorName: "",
    medicines: [{ name: "", dosage: "" }],
    date: new Date().toISOString().split("T")[0],
  });

  const [qrCode, setQrCode] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState(null);
  const [prescriptionId, setPrescriptionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [printHTML, setPrintHTML] = useState(null);

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
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail,
        doctorName: formData.doctorName || "Dr. MediConnect",
        medicines: formData.medicines,
        date: formData.date,
      });

      if (data.success) {
        setQrCode(data.qr);
        setPrescriptionText(data.prescriptionData);
        setPrescriptionId(data.prescriptionId);
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

  // Send prescription via email
  const sendEmail = async () => {
    if (!formData.patientEmail) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setSendingEmail(true);
      const { data } = await axios.post(`${backendUrl}/api/qr/send-email`, {
        patientEmail: formData.patientEmail,
        patientName: formData.patientName,
        doctorName: formData.doctorName,
        medicines: formData.medicines,
        date: formData.date,
        qrCode: qrCode,
      });

      if (data.success) {
        toast.success("✅ Prescription sent to email!");
      } else {
        toast.error(data.message || "Failed to send email");
      }
    } catch (error) {
      toast.error("Error sending email: " + error.message);
      console.log(error);
    } finally {
      setSendingEmail(false);
    }
  };

  // Send prescription via SMS
  const sendSMS = async () => {
    if (!formData.patientPhone) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setSendingSMS(true);
      const { data } = await axios.post(`${backendUrl}/api/qr/send-sms`, {
        patientPhone: formData.patientPhone,
        patientName: formData.patientName,
        medicines: formData.medicines,
      });

      if (data.success) {
        toast.success("✅ Prescription sent via SMS!");
        toast.info(`SMS Preview: ${data.smsPreview}`);
      } else {
        toast.error(data.message || "Failed to send SMS");
      }
    } catch (error) {
      toast.error("Error sending SMS: " + error.message);
      console.log(error);
    } finally {
      setSendingSMS(false);
    }
  };

  // Get printable prescription
  const getPrintVersion = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/qr/print-prescription`, {
        patientName: formData.patientName,
        doctorName: formData.doctorName,
        medicines: formData.medicines,
        date: formData.date,
        qrCode: qrCode,
        prescriptionId: prescriptionId,
      });

      if (data.success) {
        setPrintHTML(data.html);
        toast.success("Opening print preview...");
        
        // Open print preview in new window
        setTimeout(() => {
          const printWindow = window.open("", "_blank");
          printWindow.document.write(data.html);
          printWindow.document.close();
          printWindow.print();
        }, 500);
      }
    } catch (error) {
      toast.error("Failed to generate print version");
      console.log(error);
    }
  };

  // Download QR Code
  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `prescription_${formData.patientName}_${prescriptionId}.png`;
    link.click();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      patientName: "",
      patientPhone: "",
      patientEmail: "",
      doctorName: "",
      medicines: [{ name: "", dosage: "" }],
      date: new Date().toISOString().split("T")[0],
    });
    setQrCode(null);
    setPrescriptionText(null);
    setPrescriptionId(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">📋 Digital Prescription System</h1>
          <p className="text-purple-100">
            QR Code • Print • Email • SMS • Help Desk Support - Choose your preference
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Form Section */}
        {showForm ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Digital Prescription</h2>

            <form onSubmit={generateQR} className="space-y-6">
              {/* Patient Information */}
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-900 mb-4">👤 Patient Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Patient Name */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Patient Name * <span className="text-red-500">(Required)</span>
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

                  {/* Patient Phone */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      📱 Phone Number <span className="text-gray-500 text-sm">(For SMS)</span>
                    </label>
                    <input
                      type="tel"
                      name="patientPhone"
                      value={formData.patientPhone}
                      onChange={handleChange}
                      placeholder="03001234567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Patient Email */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      📧 Email Address <span className="text-gray-500 text-sm">(For Email)</span>
                    </label>
                    <input
                      type="email"
                      name="patientEmail"
                      value={formData.patientEmail}
                      onChange={handleChange}
                      placeholder="patient@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold text-green-900 mb-4">👨‍⚕️ Doctor Information</h3>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Doctor Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    placeholder="Dr. Name or leave blank"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Medicines Section */}
              <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-bold text-yellow-900 mb-4">
                  💊 Prescribed Medicines * (At least one required)
                </h3>

                <div className="space-y-3">
                  {formData.medicines.map((medicine, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-end bg-white p-4 rounded-lg border border-gray-300"
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Medicine name (e.g., Aspirin)"
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
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-semibold"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addMedicine}
                  className="mt-3 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition font-semibold"
                >
                  + Add Another Medicine
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold transition text-lg"
                >
                  {loading ? "Generating..." : "📱 Generate QR Code"}
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-purple-100 border-l-4 border-purple-500 p-4 rounded">
                <p className="text-gray-700">
                  <strong>ℹ️ Info:</strong> Phone and email are optional but recommended. 
                  They enable SMS and email sharing options for easy access by patients and help desk.
                </p>
              </div>
            </form>
          </div>
        ) : null}

        {/* QR Code Display Section */}
        {qrCode && (
          <div className="space-y-8">
            {/* Main QR Display */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                ✅ Prescription Generated Successfully!
              </h2>

              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {/* QR Code */}
                <div className="flex flex-col items-center md:col-span-1">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-6 rounded-lg border-2 border-purple-300 w-full">
                    <img
                      src={qrCode}
                      alt="Prescription QR Code"
                      className="w-full"
                    />
                  </div>
                  <p className="mt-4 text-gray-600 text-center text-sm">
                    📱 Scan at pharmacy or share with patient
                  </p>
                  <button
                    onClick={downloadQR}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition font-semibold text-sm w-full"
                  >
                    💾 Download QR
                  </button>
                </div>

                {/* Prescription Details */}
                <div className="md:col-span-2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    📋 Prescription Details
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 whitespace-pre-wrap text-sm font-mono text-gray-700 max-h-96 overflow-y-auto">
                    {prescriptionText}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ID: {prescriptionId}
                  </p>
                </div>
              </div>

              {/* Distribution Methods */}
              <div className="border-t pt-8 mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">
                  🔄 Share Prescription with Patient
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Email Option */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      📧 Send via Email
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {formData.patientEmail || "No email provided"}
                    </p>
                    <button
                      onClick={sendEmail}
                      disabled={!formData.patientEmail || sendingEmail}
                      className={`w-full py-2 rounded-lg font-semibold transition ${
                        formData.patientEmail
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {sendingEmail ? "Sending..." : "Send Email"}
                    </button>
                  </div>

                  {/* SMS Option */}
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      📱 Send via SMS
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {formData.patientPhone || "No phone provided"}
                    </p>
                    <button
                      onClick={sendSMS}
                      disabled={!formData.patientPhone || sendingSMS}
                      className={`w-full py-2 rounded-lg font-semibold transition ${
                        formData.patientPhone
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {sendingSMS ? "Sending..." : "Send SMS"}
                    </button>
                  </div>

                  {/* Print Option */}
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                      🖨️ Print Prescription
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Professional printed format
                    </p>
                    <button
                      onClick={getPrintVersion}
                      className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition"
                    >
                      Open Print Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Desk Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-lg p-8 border-l-4 border-indigo-500">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📞 Help Desk Support (Non-Technical Users)
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Phone Support */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="font-bold text-lg text-gray-800 mb-3">📞 Call Help Desk</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Primary:</strong> +92-300-XXXXX</p>
                    <p><strong>Secondary:</strong> +92-21-XXXXX</p>
                    <p><strong>Hours:</strong> 9 AM - 9 PM (Mon-Sun)</p>
                    <p><strong>Cost:</strong> Free on network</p>
                  </div>
                  <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition">
                    Call Now
                  </button>
                </div>

                {/* Email Support */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="font-bold text-lg text-gray-800 mb-3">📧 Email Support</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Email:</strong> support@mediconnect.pk</p>
                    <p><strong>Subject:</strong> Prescription Help</p>
                    <p><strong>Response Time:</strong> Within 2 hours</p>
                    <p><strong>Include:</strong> Prescription ID</p>
                  </div>
                  <button className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition">
                    Send Email
                  </button>
                </div>

                {/* Walk-In Support */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="font-bold text-lg text-gray-800 mb-3">🏥 Visit Help Desk</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Location:</strong> Main Branch</p>
                    <p><strong>Address:</strong> Karachi, Pakistan</p>
                    <p><strong>Hours:</strong> 9 AM - 9 PM</p>
                    <p><strong>Service:</strong> Free assistance</p>
                  </div>
                  <button className="mt-4 w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold transition">
                    Get Directions
                  </button>
                </div>
              </div>

              {/* Alternative Access Methods */}
              <div className="mt-6 bg-white rounded-lg p-6">
                <h4 className="font-bold text-lg text-gray-800 mb-4">🔍 Verify Prescription at Pharmacy</h4>
                <p className="text-gray-600 mb-4">
                  Pharmacists can verify prescriptions using our system without requiring patient to have a smartphone:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✓ <strong>Ask for Patient Name & Phone:</strong> Pharmacist can call help desk to verify</li>
                  <li>✓ <strong>Print & Mail Option:</strong> Patient can request printed copy via help desk</li>
                  <li>✓ <strong>SMS Access Code:</strong> Patient receives SMS with unique access code</li>
                  <li>✓ <strong>On-site Verification:</strong> Help desk staff can verify at pharmacy location</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mb-8">
              <button
                onClick={resetForm}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold transition text-lg"
              >
                ➕ Create New Prescription
              </button>
              <button
                onClick={() => window.print()}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold transition text-lg"
              >
                📋 Print This Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPrescription;

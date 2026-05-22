import ambulanceModel from "../models/ambulanceModel.js";
import userModel from "../models/userModel.js";

// Request ambulance
const requestAmbulance = async (req, res) => {
    try {
        const { userId, patientName, location, contactNumber, description } = req.body;

        // Validation
        if (!userId || !patientName || !location || !contactNumber || !description) {
            return res.json({ success: false, message: "Missing Details" });
        }

        const ambulanceData = {
            userId,
            patientName,
            location,
            contactNumber,
            description,
            requestDate: Date.now(),
            status: 'pending',
            estimatedTime: '15 mins'
        };

        const ambulance = new ambulanceModel(ambulanceData);
        await ambulance.save();

        res.json({ success: true, message: "Ambulance requested successfully", ambulance });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get ambulance requests (user's requests)
const getAmbulanceRequests = async (req, res) => {
    try {
        const { userId } = req.body;
        const requests = await ambulanceModel.find({ userId });
        res.json({ success: true, requests });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all ambulance requests (admin view)
const getAllAmbulanceRequests = async (req, res) => {
    try {
        const requests = await ambulanceModel.find({});
        res.json({ success: true, requests });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update ambulance request status (admin)
const updateAmbulanceStatus = async (req, res) => {
    try {
        const { ambulanceId, status } = req.body;
        
        if (!ambulanceId || !status) {
            return res.json({ success: false, message: "Missing Details" });
        }

        await ambulanceModel.findByIdAndUpdate(ambulanceId, { status });
        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Cancel ambulance request
const cancelAmbulanceRequest = async (req, res) => {
    try {
        const { ambulanceId } = req.body;
        await ambulanceModel.findByIdAndUpdate(ambulanceId, { status: 'cancelled' });
        res.json({ success: true, message: "Request cancelled" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    requestAmbulance,
    getAmbulanceRequests,
    getAllAmbulanceRequests,
    updateAmbulanceStatus,
    cancelAmbulanceRequest
};

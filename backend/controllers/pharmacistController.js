import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import pharmacistModel from '../models/pharmacistModel.js';

const registerPharmacist = async (req, res) => {
    try {
        const { name, email, password, phone, licenseNumber, pharmacy } = req.body;

        if (!name || !email || !password || !phone || !licenseNumber || !pharmacy) {
            return res.json({ success: false, message: 'All fields are required' });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Invalid email' });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: 'Password must be at least 8 characters' });
        }

        // Check if pharmacist already exists
        const existingPharmacist = await pharmacistModel.findOne({ email });
        if (existingPharmacist) {
            return res.json({ success: false, message: 'Pharmacist already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const pharmacist = new pharmacistModel({
            name,
            email,
            password: hashedPassword,
            phone,
            licenseNumber,
            pharmacy,
            date: Date.now()
        });

        await pharmacist.save();

        // Generate token
        const token = jwt.sign({ id: pharmacist._id }, process.env.JWT_SECRET);

        res.json({
            success: true,
            message: 'Pharmacist registered successfully',
            token
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const loginPharmacist = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' });
        }

        const pharmacist = await pharmacistModel.findOne({ email });

        if (!pharmacist) {
            return res.json({ success: false, message: 'Pharmacist not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, pharmacist.password);

        if (!isPasswordValid) {
            return res.json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign({ id: pharmacist._id }, process.env.JWT_SECRET);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            pharmacist: {
                _id: pharmacist._id,
                name: pharmacist.name,
                email: pharmacist.email,
                phone: pharmacist.phone,
                pharmacy: pharmacist.pharmacy,
                licenseNumber: pharmacist.licenseNumber
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const getPharmacistProfile = async (req, res) => {
    try {
        const { pharmacistId } = req.body;

        const pharmacist = await pharmacistModel.findById(pharmacistId);

        if (!pharmacist) {
            return res.json({ success: false, message: 'Pharmacist not found' });
        }

        res.json({
            success: true,
            pharmacist: {
                _id: pharmacist._id,
                name: pharmacist.name,
                email: pharmacist.email,
                phone: pharmacist.phone,
                pharmacy: pharmacist.pharmacy,
                licenseNumber: pharmacist.licenseNumber,
                image: pharmacist.image,
                experience: pharmacist.experience,
                about: pharmacist.about,
                address: pharmacist.address,
                available: pharmacist.available
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const updatePharmacistProfile = async (req, res) => {
    try {
        const { pharmacistId, name, phone, address, about, experience } = req.body;

        const pharmacist = await pharmacistModel.findByIdAndUpdate(
            pharmacistId,
            {
                name,
                phone,
                address,
                about,
                experience
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            pharmacist
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

const getAllPharmacists = async (req, res) => {
    try {
        const pharmacists = await pharmacistModel.find({}).select('-password');

        res.json({
            success: true,
            pharmacists
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { registerPharmacist, loginPharmacist, getPharmacistProfile, updatePharmacistProfile, getAllPharmacists };

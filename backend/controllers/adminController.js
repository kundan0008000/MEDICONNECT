import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import { sendNotificationHelper } from "../utils/notificationHelper.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        // First check if it's the main admin credentials from .env
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            return res.json({ success: true, token, message: "Admin login successful" })
        }

        // Otherwise, check if user exists in database (allow registered users to login as admin)
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET)
            return res.json({ success: true, token, message: "User login as admin successful" })
        } else {
            return res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
        
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // Send cancellation notification to patient
        await sendNotificationHelper(
            String(appointmentData.userId),
            'appointment',
            '❌ Appointment Cancelled by Admin',
            `Your appointment with Dr. ${appointmentData.docData.name} has been cancelled by administrator`,
            `Date: ${appointmentData.slotDate} | Time: ${appointmentData.slotTime}`,
            '⚠️',
            '/my-appointments',
            { appointmentId: String(appointmentId) }
        );

        // Send cancellation notification to doctor
        await sendNotificationHelper(
            String(appointmentData.docId),
            'appointment',
            '❌ Appointment Cancelled by Admin',
            `Appointment with ${appointmentData.userData.name} has been cancelled by administrator`,
            `Date: ${appointmentData.slotDate} | Time: ${appointmentData.slotTime}`,
            '⚠️',
            '/appointments',
            { appointmentId }
        );

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for adding Doctor
const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        res.json({ success: true, message: 'Doctor Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get admin profile
const getAdminProfile = async (req, res) => {
    try {
        // Check if main admin
        if (req.isMainAdmin) {
            return res.json({
                success: true,
                admin: {
                    email: req.adminEmail,
                    name: 'Main Admin',
                    type: 'main'
                }
            })
        }

        // If user admin from database
        if (req.userId) {
            const adminUser = await userModel.findById(req.userId)
            if (!adminUser) {
                return res.json({ success: false, message: "Admin not found" })
            }
            return res.json({
                success: true,
                admin: {
                    id: adminUser._id,
                    email: adminUser.email,
                    name: adminUser.name || 'Admin',
                    type: 'user'
                }
            })
        }

        return res.json({ success: false, message: "Invalid admin session" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to change admin password
const changeAdminPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.json({ success: false, message: "All fields are required" })
        }

        if (newPassword !== confirmPassword) {
            return res.json({ success: false, message: "Passwords do not match" })
        }

        if (newPassword.length < 6) {
            return res.json({ success: false, message: "Password must be at least 6 characters" })
        }

        // Main admin from .env
        if (req.isMainAdmin) {
            if (oldPassword === process.env.ADMIN_PASSWORD) {
                process.env.ADMIN_PASSWORD = newPassword
                return res.json({ success: true, message: "Password changed successfully (restart server to apply)" })
            } else {
                return res.json({ success: false, message: "Old password is incorrect" })
            }
        }

        // User admin from database
        if (req.userId) {
            const adminUser = await userModel.findById(req.userId)
            if (!adminUser) {
                return res.json({ success: false, message: "Admin not found" })
            }

            // Check old password
            const isMatch = await bcrypt.compare(oldPassword, adminUser.password)
            if (!isMatch) {
                return res.json({ success: false, message: "Old password is incorrect" })
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(newPassword, salt)

            // Update password
            await userModel.findByIdAndUpdate(req.userId, { password: hashedPassword })

            res.json({ success: true, message: "Password changed successfully" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to change admin email
const changeAdminEmail = async (req, res) => {
    try {
        const { newEmail, password } = req.body

        // Validation
        if (!newEmail || !password) {
            return res.json({ success: false, message: "Email and password are required" })
        }

        if (!validator.isEmail(newEmail)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // Main admin from .env
        if (req.isMainAdmin) {
            if (password === process.env.ADMIN_PASSWORD) {
                // Store old email notification
                console.log(`✅ Email change request: ${process.env.ADMIN_EMAIL} → ${newEmail} (restart server to apply)`)
                return res.json({ success: true, message: "Email change request submitted (restart server to apply)" })
            } else {
                return res.json({ success: false, message: "Password is incorrect" })
            }
        }

        // User admin from database
        if (req.userId) {
            const adminUser = await userModel.findById(req.userId)
            if (!adminUser) {
                return res.json({ success: false, message: "Admin not found" })
            }

            // Check password
            const isMatch = await bcrypt.compare(password, adminUser.password)
            if (!isMatch) {
                return res.json({ success: false, message: "Password is incorrect" })
            }

            // Check if new email already exists
            const emailExists = await userModel.findOne({ email: newEmail, _id: { $ne: req.userId } })
            if (emailExists) {
                return res.json({ success: false, message: "Email already in use" })
            }

            // Update email
            await userModel.findByIdAndUpdate(req.userId, { email: newEmail })

            res.json({ success: true, message: "Email changed successfully" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    adminDashboard,
    getAdminProfile,
    changeAdminPassword,
    changeAdminEmail
}
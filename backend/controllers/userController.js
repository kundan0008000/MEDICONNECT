import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stripe from "stripe";
import razorpay from 'razorpay';
import { sendNotificationHelper } from "../utils/notificationHelper.js";
import smsHelper from "../utils/smsHelper.js";

// Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
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

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const userId = req.body.userId
        if (!userId) {
            return res.json({ success: false, message: 'User not authorized' })
        }
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        let slots_booked = docData.slots_booked

        // checking for slot availablity 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Send notification to user
        await sendNotificationHelper(
            String(userId),
            'appointment',
            '✅ Appointment Booked',
            `Your appointment with Dr. ${docData.name} has been booked successfully`,
            `Date: ${slotDate} | Time: ${slotTime}`,
            '📅',
            `/my-appointments`,
            { appointmentId: String(newAppointment._id), doctorName: docData.name }
        );

        // Send SMS to patient if phone number exists
        if (userData.phone && userData.phone !== '000000000') {
            await smsHelper.sendAppointmentSMS(
                userData.phone,
                userData.name,
                docData.name,
                slotDate,
                slotTime
            );
        }

        // Send notification to doctor
        await sendNotificationHelper(
            String(docId),
            'appointment',
            '📍 New Appointment',
            `New appointment booked by ${userData.name}`,
            `Date: ${slotDate} | Time: ${slotTime}`,
            '👤',
            `/appointments`,
            { appointmentId: newAppointment._id, patientName: userData.name }
        );

        res.json({ success: true, message: 'Appointment Booked' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Send notification to user
        await sendNotificationHelper(
            String(userId),
            'appointment',
            '❌ Appointment Cancelled',
            `Your appointment with Dr. ${appointmentData.docData.name} has been cancelled`,
            `The slot on ${slotDate} at ${slotTime} is now available`,
            '🚫',
            '/my-appointments',
            { appointmentId: String(appointmentId) }
        );

        // Send SMS to patient if phone number exists
        if (appointmentData.userData.phone && appointmentData.userData.phone !== '000000000') {
            await smsHelper.sendCancellationSMS(
                appointmentData.userData.phone,
                appointmentData.userData.name,
                appointmentData.docData.name
            );
        }

        // Send notification to doctor
        await sendNotificationHelper(
            String(docId),
            'appointment',
            '❌ Appointment Cancelled',
            `Appointment cancelled by ${appointmentData.userData.name}`,
            `Slot ${slotDate} at ${slotTime} is now free`,
            '🚫',
            '/appointments',
            { appointmentId }
        );

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            
            // Send payment confirmation notification
            const appointmentData = await appointmentModel.findById(orderInfo.receipt)
            await sendNotificationHelper(
                String(appointmentData.userId),
                'appointment',
                '💳 Payment Successful',
                'Your appointment payment has been confirmed',
                `Amount: ₹${appointmentData.amount} | Booking: ${appointmentData.slotDate}`,
                '✅',
                '/my-appointments',
                { appointmentId: String(orderInfo.receipt) }
            );

            // Notify doctor of confirmed payment
            await sendNotificationHelper(
                String(appointmentData.docId),
                'appointment',
                '💳 Payment Confirmed',
                `Payment confirmed for ${appointmentData.userData.name}'s appointment`,
                `Amount: ₹${appointmentData.amount}`,
                '💰',
                '/appointments',
                { appointmentId: orderInfo.receipt }
            );

            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {
        // ⚠️ TEMPORARILY DISABLED - Waiting for valid Stripe API key
        // To enable: Add valid STRIPE_SECRET_KEY from stripe.com
        return res.json({ 
            success: false, 
            message: 'Stripe payment temporarily disabled. Please use Razorpay.' 
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req, res) => {
    try {

        const { appointmentId, success } = req.body

        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
            
            // Send payment confirmation notification
            const appointmentData = await appointmentModel.findById(appointmentId)
            await sendNotificationHelper(
                String(appointmentData.userId),
                'appointment',
                '💳 Payment Successful',
                'Your appointment payment has been confirmed',
                `Amount: ₹${appointmentData.amount} | Booking: ${appointmentData.slotDate}`,
                '✅',
                '/my-appointments',
                { appointmentId: String(appointmentId) }
            );

            // Notify doctor of confirmed payment
            await sendNotificationHelper(
                String(appointmentData.docId),
                'appointment',
                '💳 Payment Confirmed',
                `Payment confirmed for ${appointmentData.userData.name}'s appointment`,
                `Amount: ₹${appointmentData.amount}`,
                '💰',
                '/appointments',
                { appointmentId }
            );

            return res.json({ success: true, message: 'Payment Successful' })
        }

        res.json({ success: false, message: 'Payment Failed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe
}
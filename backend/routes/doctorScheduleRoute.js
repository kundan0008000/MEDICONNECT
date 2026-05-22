import express from 'express';
import doctorScheduleModel from '../models/doctorScheduleModel.js';
import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js';
import authAdmin from '../middleware/authAdmin.js';
import authDoctor from '../middleware/authDoctor.js';

const router = express.Router();

/**
 * Initialize or get doctor schedule
 */
router.post('/init-schedule', authAdmin, async (req, res) => {
    try {
        const { docId } = req.body;

        if (!docId) {
            return res.json({ success: false, message: 'Doctor ID is required' });
        }

        const doctor = await doctorModel.findById(docId);
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        let schedule = await doctorScheduleModel.findOne({ docId: String(docId) });

        if (!schedule) {
            schedule = new doctorScheduleModel({
                docId: String(docId),
                doctorName: doctor.name,
                speciality: doctor.speciality,
                consultationFee: doctor.fees,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            await schedule.save();
        }

        res.json({ success: true, schedule });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

/**
 * Get doctor availability
 */
router.get('/availability/:docId', async (req, res) => {
    try {
        const { docId } = req.params;

        let schedule = await doctorScheduleModel.findOne({ docId: String(docId) });

        if (!schedule) {
            const doctor = await doctorModel.findById(docId);
            if (!doctor) {
                return res.json({ success: false, message: 'Doctor not found' });
            }

            schedule = new doctorScheduleModel({
                docId: String(docId),
                doctorName: doctor.name,
                speciality: doctor.speciality,
                consultationFee: doctor.fees,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            await schedule.save();
        }

        // Calculate today's and this week's appointments
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        const todayAppointments = await appointmentModel.countDocuments({
            docId: String(docId),
            cancelled: false,
            slotDate: {
                $gte: Math.floor(todayStart.getTime() / 1000),
                $lt: Math.floor(todayEnd.getTime() / 1000)
            }
        });

        const weekAppointments = await appointmentModel.countDocuments({
            docId: String(docId),
            cancelled: false,
            slotDate: {
                $gte: Math.floor(weekStart.getTime() / 1000),
                $lt: Math.floor(weekEnd.getTime() / 1000)
            }
        });

        // Update schedule
        schedule.todayAppointments = todayAppointments;
        schedule.thisWeekAppointments = weekAppointments;
        schedule.updatedAt = Date.now();
        await schedule.save();

        res.json({ 
            success: true, 
            availability: {
                docId: String(docId),
                doctorName: schedule.doctorName,
                speciality: schedule.speciality,
                consultationFee: schedule.consultationFee,
                todayAppointments,
                thisWeekAppointments,
                thisMonthAppointments: schedule.thisMonthAppointments,
                nextAvailableDate: schedule.nextAvailableDate,
                nextAvailableTime: schedule.nextAvailableTime,
                workingHours: schedule.workingHours,
                isAvailable: schedule.available
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

/**
 * Get doctor bookings for a specific date
 */
router.get('/bookings/:docId/:date', async (req, res) => {
    try {
        const { docId, date } = req.params;

        const appointments = await appointmentModel.find({
            docId: String(docId),
            slotDate: date,
            cancelled: false
        }).select('slotTime userData isCompleted payment');

        res.json({ 
            success: true, 
            date,
            appointments: appointments.map(apt => ({
                time: apt.slotTime,
                patient: apt.userData?.name || 'Unknown',
                completed: apt.isCompleted,
                paid: apt.payment
            }))
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

/**
 * Get all doctors with their availability
 */
router.get('/all-availability', async (req, res) => {
    try {
        const doctors = await doctorModel.find({ available: true }).select('_id name speciality fees');
        
        const doctorAvailability = await Promise.all(
            doctors.map(async (doctor) => {
                let schedule = await doctorScheduleModel.findOne({ docId: String(doctor._id) });
                
                if (!schedule) {
                    schedule = new doctorScheduleModel({
                        docId: String(doctor._id),
                        doctorName: doctor.name,
                        speciality: doctor.speciality,
                        consultationFee: doctor.fees,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    });
                    await schedule.save();
                }

                const appointments = await appointmentModel.countDocuments({
                    docId: String(doctor._id),
                    cancelled: false
                });

                return {
                    _id: String(doctor._id),
                    name: doctor.name,
                    speciality: doctor.speciality,
                    consultationFee: doctor.fees,
                    totalBookedAppointments: appointments,
                    nextAvailable: schedule.nextAvailableDate || 'Soon'
                };
            })
        );

        res.json({ success: true, doctors: doctorAvailability });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

/**
 * Update doctor working hours
 */
router.post('/update-hours', authDoctor, async (req, res) => {
    try {
        const { docId, workingHours } = req.body;

        if (!docId || !workingHours) {
            return res.json({ success: false, message: 'Doctor ID and working hours are required' });
        }

        let schedule = await doctorScheduleModel.findOne({ docId: String(docId) });

        if (!schedule) {
            return res.json({ success: false, message: 'Schedule not found. Initialize schedule first.' });
        }

        schedule.workingHours = workingHours;
        schedule.updatedAt = Date.now();
        await schedule.save();

        res.json({ success: true, message: 'Working hours updated', schedule });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

/**
 * Get doctor statistics
 */
router.get('/stats/:docId', authDoctor, async (req, res) => {
    try {
        const { docId } = req.params;

        const schedule = await doctorScheduleModel.findOne({ docId: String(docId) });

        const appointments = await appointmentModel.find({ docId: String(docId) });
        const completed = appointments.filter(a => a.isCompleted).length;
        const cancelled = appointments.filter(a => a.cancelled).length;
        const paid = appointments.filter(a => a.payment).length;

        const stats = {
            totalAppointments: appointments.length,
            completedAppointments: completed,
            cancelledAppointments: cancelled,
            upcomingAppointments: appointments.filter(a => !a.cancelled && !a.isCompleted).length,
            paidAppointments: paid,
            totalEarnings: appointments.filter(a => a.payment).reduce((sum, a) => sum + a.amount, 0),
            averageRating: 4.5, // TODO: Implement rating system
            consultationFee: schedule?.consultationFee || 0
        };

        res.json({ success: true, stats });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

/**
 * Get doctor booking status (booked days and next free date)
 */
router.get('/booking-status/all', async (req, res) => {
    try {
        const doctors = await doctorModel.find({ available: true }).select('_id name speciality fees');
        
        const bookingStatus = await Promise.all(
            doctors.map(async (doctor) => {
                // Get all appointments for this doctor
                const appointments = await appointmentModel.find({
                    docId: String(doctor._id),
                    cancelled: false
                }).select('slotDate');

                // Get unique booked dates
                const bookedDates = [...new Set(appointments.map(apt => apt.slotDate))];
                
                // Calculate next free date
                const today = new Date();
                let nextFreeDate = new Date(today);
                let daysBooked = 0;
                
                for (let i = 0; i < 30; i++) { // Check next 30 days
                    const checkDate = new Date(today);
                    checkDate.setDate(today.getDate() + i);
                    const dateStr = checkDate.toISOString().split('T')[0];
                    
                    if (bookedDates.includes(dateStr)) {
                        daysBooked++;
                    } else if (daysBooked > 0) {
                        // Found first free date after booked dates
                        nextFreeDate = new Date(checkDate);
                        break;
                    }
                }

                return {
                    _id: String(doctor._id),
                    name: doctor.name,
                    speciality: doctor.speciality,
                    consultationFee: doctor.fees,
                    totalAppointments: appointments.length,
                    bookedDays: bookedDates.length,
                    nextFreeDate: nextFreeDate.toISOString().split('T')[0],
                    daysUntilFree: Math.ceil((nextFreeDate - today) / (1000 * 60 * 60 * 24))
                };
            })
        );

        res.json({ success: true, doctors: bookingStatus });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

export default router;

import mongoose from "mongoose";

const doctorScheduleSchema = new mongoose.Schema({
    docId: { type: String, required: true, unique: true },
    doctorName: { type: String, required: true },
    speciality: { type: String, required: true },
    totalAppointmentsBooked: { type: Number, default: 0 },
    totalAppointmentsCompleted: { type: Number, default: 0 },
    totalAppointmentsCancelled: { type: Number, default: 0 },
    avgConsultationTime: { type: Number, default: 30 }, // minutes
    todayAppointments: { type: Number, default: 0 },
    thisWeekAppointments: { type: Number, default: 0 },
    thisMonthAppointments: { type: Number, default: 0 },
    nextAvailableDate: { type: String }, // Format: YYYY-MM-DD
    nextAvailableTime: { type: String }, // Format: HH:MM
    patientWaitlist: { type: Number, default: 0 },
    consultationFee: { type: Number, required: true },
    workingHours: {
        monday: { 
            start: { type: String, default: '09:00' }, 
            end: { type: String, default: '17:00' }, 
            isWorking: { type: Boolean, default: true }
        },
        tuesday: { 
            start: { type: String, default: '09:00' }, 
            end: { type: String, default: '17:00' }, 
            isWorking: { type: Boolean, default: true }
        },
        wednesday: { 
            start: { type: String, default: '09:00' }, 
            end: { type: String, default: '17:00' }, 
            isWorking: { type: Boolean, default: true }
        },
        thursday: { 
            start: { type: String, default: '09:00' }, 
            end: { type: String, default: '17:00' }, 
            isWorking: { type: Boolean, default: true }
        },
        friday: { 
            start: { type: String, default: '09:00' }, 
            end: { type: String, default: '17:00' }, 
            isWorking: { type: Boolean, default: true }
        },
        saturday: { 
            start: { type: String, default: '10:00' }, 
            end: { type: String, default: '14:00' }, 
            isWorking: { type: Boolean, default: true }
        },
        sunday: { 
            start: { type: String, default: '09:00' }, 
            end: { type: String, default: '17:00' }, 
            isWorking: { type: Boolean, default: false }
        }
    },
    breaks: [
        {
            name: { type: String },
            startTime: { type: String },
            endTime: { type: String },
            dayOfWeek: { type: String }
        }
    ],
    updatedAt: { type: Number, required: true },
    createdAt: { type: Number, required: true },
}, { minimize: false });

const doctorScheduleModel = mongoose.models.doctorSchedule || mongoose.model("doctorSchedule", doctorScheduleSchema);
export default doctorScheduleModel;

import nodemailer from 'nodemailer';
import twilio from 'twilio';

// SMS/Notification Helper - Supports both SMS and Email notifications
class SMSNotificationHelper {
    constructor() {
        // Initialize Twilio client if credentials are provided and valid
        if (process.env.TWILIO_ACCOUNT_SID && 
            process.env.TWILIO_AUTH_TOKEN && 
            process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
            try {
                this.twilioClient = twilio(
                    process.env.TWILIO_ACCOUNT_SID,
                    process.env.TWILIO_AUTH_TOKEN
                );
                console.log('✅ Twilio SMS service initialized');
            } catch (error) {
                console.warn('⚠️ Twilio initialization failed:', error.message);
                this.twilioClient = null;
            }
        } else {
            this.twilioClient = null;
            console.log('⚠️ Twilio not configured - SMS will be logged to console');
        }

        // Initialize email transporter (fallback for SMS)
        this.emailTransporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    /**
     * Send SMS notification to patient/doctor
     * Uses Twilio if configured, otherwise logs to console
     */
    async sendSMS(phoneNumber, message, recipientName = '') {
        try {
            if (!phoneNumber || phoneNumber === '000000000') {
                return {
                    success: false,
                    error: 'Invalid phone number',
                    phone: phoneNumber
                };
            }

            // If Twilio is configured, send real SMS
            if (this.twilioClient && process.env.TWILIO_PHONE_NUMBER) {
                const result = await this.twilioClient.messages.create({
                    body: message,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phoneNumber.startsWith('+') ? phoneNumber : `+92${phoneNumber.slice(-10)}`
                });

                console.log(`✅ SMS sent to ${phoneNumber} (SID: ${result.sid})`);
                return {
                    success: true,
                    message: 'SMS sent successfully via Twilio',
                    phone: phoneNumber,
                    messageSid: result.sid,
                    timestamp: new Date()
                };
            } else {
                // Fallback: Log to console for testing
                console.log(`\n${'='.repeat(60)}`);
                console.log(`📱 SMS NOTIFICATION (Test Mode)`);
                console.log(`${'='.repeat(60)}`);
                console.log(`To: ${phoneNumber}`);
                if (recipientName) console.log(`Recipient: ${recipientName}`);
                console.log(`Message: ${message}`);
                console.log(`Timestamp: ${new Date().toISOString()}`);
                console.log(`${'='.repeat(60)}\n`);

                return {
                    success: true,
                    message: 'SMS logged to console (Twilio not configured)',
                    phone: phoneNumber,
                    timestamp: new Date()
                };
            }
        } catch (error) {
            console.error('❌ SMS send error:', error.message);
            return {
                success: false,
                error: error.message,
                phone: phoneNumber
            };
        }
    }

    /**
     * Send appointment confirmation SMS
     */
    async sendAppointmentSMS(patientPhone, patientName, doctorName, appointmentDate, appointmentTime) {
        const message = `Hi ${patientName}, your appointment with Dr. ${doctorName} is confirmed for ${appointmentDate} at ${appointmentTime}. Please arrive 10 minutes early. For cancellation, contact us.`;
        return this.sendSMS(patientPhone, message, patientName);
    }

    /**
     * Send appointment cancellation SMS
     */
    async sendCancellationSMS(patientPhone, patientName, doctorName) {
        const message = `Hi ${patientName}, your appointment with Dr. ${doctorName} has been cancelled. Please book a new appointment if needed.`;
        return this.sendSMS(patientPhone, message, patientName);
    }

    /**
     * Send prescription SMS
     */
    async sendPrescriptionSMS(patientPhone, patientName) {
        const message = `Hi ${patientName}, your prescription is ready for pickup. Visit your nearest pharmacy with your ID.`;
        return this.sendSMS(patientPhone, message, patientName);
    }

    /**
     * Send stock alert SMS to pharmacist
     */
    async sendStockAlertSMS(pharmacistPhone, pharmacistName, medicineName, currentStock) {
        const message = `Alert: ${medicineName} stock is low (${currentStock} units). Please reorder immediately.`;
        return this.sendSMS(pharmacistPhone, message, pharmacistName);
    }

    /**
     * Send doctor notification SMS
     */
    async sendDoctorNotificationSMS(doctorPhone, doctorName, message) {
        return this.sendSMS(doctorPhone, `Dr. ${doctorName}, ${message}`, doctorName);
    }

    /**
     * Send email as fallback
     */
    async sendEmail(to, subject, htmlContent) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: to,
                subject: subject,
                html: htmlContent
            };

            await this.emailTransporter.sendMail(mailOptions);
            console.log(`📧 Email sent to ${to}: ${subject}`);
            return { success: true };
        } catch (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new SMSNotificationHelper();

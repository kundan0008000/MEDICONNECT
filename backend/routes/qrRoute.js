import express from 'express';
import { 
    generatePrescriptionQR,
    sendPrescriptionEmail,
    sendPrescriptionSMS,
    getPrintablePrescription,
    createPrescriptionRecord,
    verifyPrescriptionById
} from '../controllers/qrController.js';

const qrRouter = express.Router();

qrRouter.post("/generate-qr", generatePrescriptionQR)
qrRouter.post("/send-email", sendPrescriptionEmail)
qrRouter.post("/send-sms", sendPrescriptionSMS)
qrRouter.post("/print-prescription", getPrintablePrescription)
qrRouter.post("/create-record", createPrescriptionRecord)
qrRouter.post("/verify-prescription", verifyPrescriptionById)

export default qrRouter;

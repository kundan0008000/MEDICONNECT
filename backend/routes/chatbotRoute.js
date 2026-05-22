import express from 'express';
import { chatbotResponse } from '../controllers/chatbotController.js';
const chatbotRouter = express.Router();

chatbotRouter.post("/send-message", chatbotResponse)

export default chatbotRouter;

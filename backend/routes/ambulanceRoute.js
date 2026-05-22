import express from 'express';
import { requestAmbulance, getAmbulanceRequests, getAllAmbulanceRequests, updateAmbulanceStatus, cancelAmbulanceRequest } from '../controllers/ambulanceController.js';
import authUser from '../middleware/authUser.js';
import authAdmin from '../middleware/authAdmin.js';

const ambulanceRouter = express.Router();

ambulanceRouter.post("/request", authUser, requestAmbulance)
ambulanceRouter.post("/get-requests", authUser, getAmbulanceRequests)
ambulanceRouter.get("/all-requests", authAdmin, getAllAmbulanceRequests)
ambulanceRouter.post("/update-status", authAdmin, updateAmbulanceStatus)
ambulanceRouter.post("/cancel-request", authUser, cancelAmbulanceRequest)

export default ambulanceRouter;

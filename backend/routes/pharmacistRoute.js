import express from 'express';
import { registerPharmacist, loginPharmacist, getPharmacistProfile, updatePharmacistProfile, getAllPharmacists } from '../controllers/pharmacistController.js';
import authPharmacist from '../middleware/authPharmacist.js';
import authAdmin from '../middleware/authAdmin.js';

const router = express.Router();

router.post('/register', registerPharmacist);
router.post('/login', loginPharmacist);
router.get('/profile', authPharmacist, getPharmacistProfile);
router.put('/update-profile', authPharmacist, updatePharmacistProfile);
router.get('/all-pharmacists', authAdmin, getAllPharmacists);

export default router;

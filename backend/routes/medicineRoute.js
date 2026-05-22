import express from 'express';
import { 
    getAllMedicines, 
    getMedicinesByCategory, 
    searchMedicines, 
    addToCart,
    getMedicineById,
    getCategories,
    getPriceRange,
    getFeaturedMedicines
} from '../controllers/medicineController.js';

const medicineRouter = express.Router();

medicineRouter.get("/all-medicines", getAllMedicines)
medicineRouter.post("/medicines-by-category", getMedicinesByCategory)
medicineRouter.post("/search-medicines", searchMedicines)
medicineRouter.post("/medicine-by-id", getMedicineById)
medicineRouter.post("/add-to-cart", addToCart)
medicineRouter.get("/categories", getCategories)
medicineRouter.get("/price-range", getPriceRange)
medicineRouter.get("/featured-medicines", getFeaturedMedicines)

export default medicineRouter;

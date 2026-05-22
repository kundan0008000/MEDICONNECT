import medicineModel from "../models/medicineModel.js";

// Get all medicines
const getAllMedicines = async (req, res) => {
    try {
        console.log("Fetching all medicines...");
        const medicines = await medicineModel.find({});
        console.log(`Found ${medicines.length} medicines`);
        res.json({ success: true, medicines });
    } catch (error) {
        console.log("Error in getAllMedicines:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get medicines by category
const getMedicinesByCategory = async (req, res) => {
    try {
        const { category } = req.body;
        console.log("Searching medicines by category:", category);
        const medicines = await medicineModel.find({ category });
        res.json({ success: true, medicines });
    } catch (error) {
        console.log("Error in getMedicinesByCategory:", error);
        res.json({ success: false, message: error.message });
    }
};

// Simple and reliable search
const searchMedicines = async (req, res) => {
    try {
        const { query, category } = req.body;
        console.log("Search query:", query, "Category:", category);

        let filter = {};

        // Search in multiple fields with case-insensitive matching
        if (query && query.trim()) {
            const searchRegex = { $regex: query, $options: 'i' };
            filter.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { dosage: searchRegex },
                { manufacturer: searchRegex }
            ];
        }

        // Filter by category if specified
        if (category && category !== 'All' && category !== null) {
            filter.category = category;
        }

        console.log("Filter object:", JSON.stringify(filter));
        const medicines = await medicineModel.find(filter);
        console.log(`Found ${medicines.length} matching medicines`);

        res.json({ success: true, medicines, count: medicines.length });
    } catch (error) {
        console.log("Error in searchMedicines:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get medicine by ID
const getMedicineById = async (req, res) => {
    try {
        const { medicineId } = req.body;
        const medicine = await medicineModel.findById(medicineId);
        if (!medicine) {
            return res.json({ success: false, message: "Medicine not found" });
        }
        res.json({ success: true, medicine });
    } catch (error) {
        console.log("Error in getMedicineById:", error);
        res.json({ success: false, message: error.message });
    }
};

// Add medicine to cart
const addToCart = async (req, res) => {
    try {
        const { medicineId, quantity } = req.body;
        const medicine = await medicineModel.findById(medicineId);
        
        if (!medicine) {
            return res.json({ success: false, message: "Medicine not found" });
        }

        const maxStock = medicine.stockCount || medicine.quantity || 100;
        if (quantity > maxStock) {
            return res.json({ success: false, message: `Only ${maxStock} units available` });
        }

        res.json({ success: true, message: "Added to cart", medicine, quantity });
    } catch (error) {
        console.log("Error in addToCart:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = await medicineModel.distinct('category');
        const filteredCategories = categories.filter(c => c && c.trim() !== '');
        console.log("Categories found:", filteredCategories);
        res.json({ success: true, categories: filteredCategories });
    } catch (error) {
        console.log("Error in getCategories:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get price range
const getPriceRange = async (req, res) => {
    try {
        const medicines = await medicineModel.find({}).sort({ price: 1 });
        
        if (medicines.length === 0) {
            return res.json({ success: true, minPrice: 0, maxPrice: 1000 });
        }

        const minPrice = medicines[0].price || 0;
        const maxPrice = medicines[medicines.length - 1].price || 1000;

        console.log("Price range:", minPrice, "-", maxPrice);
        res.json({ success: true, minPrice, maxPrice });
    } catch (error) {
        console.log("Error in getPriceRange:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get featured medicines
const getFeaturedMedicines = async (req, res) => {
    try {
        const medicines = await medicineModel
            .find({ inStock: true })
            .sort({ rating: -1, reviews: -1 })
            .limit(6);
        res.json({ success: true, medicines });
    } catch (error) {
        console.log("Error in getFeaturedMedicines:", error);
        res.json({ success: false, message: error.message });
    }
};

export {
    getAllMedicines,
    getMedicinesByCategory,
    searchMedicines,
    addToCart,
    getMedicineById,
    getCategories,
    getPriceRange,
    getFeaturedMedicines
};

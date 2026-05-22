import mongoose from "mongoose"
import 'dotenv/config'
import medicineModel from "./models/medicineModel.js"
import connectDB from "./config/mongodb.js"

connectDB()

const seedMedicines = async () => {
    try {
        // Clear existing medicines
        await medicineModel.deleteMany({})

        const medicines = [
            {
                name: "Aspirin 500mg",
                category: "Pain Relief",
                price: 50,
                description: "Effective pain reliever and fever reducer",
                image: "https://images.unsplash.com/photo-1631549916768-4873b991938d?w=300&h=300&fit=crop",
                dosage: "500mg",
                manufacturer: "Bayer",
                stockCount: 100,
                rating: 4.5,
                reviews: 234,
                discount: 10,
                inStock: true,
                quantity: 100,
                date: Date.now()
            },
            {
                name: "Paracetamol 250mg",
                category: "Pain Relief",
                price: 40,
                description: "Safe pain and fever relief for all ages",
                image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=300&h=300&fit=crop",
                dosage: "250mg",
                manufacturer: "GSK",
                stockCount: 150,
                rating: 4.7,
                reviews: 456,
                discount: 15,
                inStock: true,
                quantity: 150,
                date: Date.now()
            },
            {
                name: "Amoxicillin 500mg",
                category: "Antibiotics",
                price: 120,
                description: "Broad-spectrum antibiotic for infections",
                image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=300&h=300&fit=crop",
                dosage: "500mg",
                manufacturer: "Abbott",
                stockCount: 50,
                rating: 4.6,
                reviews: 189,
                discount: 5,
                requiresPrescription: true,
                inStock: true,
                quantity: 50,
                date: Date.now()
            },
            {
                name: "Cough Syrup",
                category: "Cough & Cold",
                price: 85,
                description: "Effective cough suppressant with honey",
                image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=300&fit=crop",
                dosage: "10ml",
                manufacturer: "Cipla",
                stockCount: 80,
                rating: 4.4,
                reviews: 312,
                discount: 8,
                inStock: true,
                quantity: 80,
                date: Date.now()
            },
            {
                name: "Vitamin D 1000IU",
                category: "Vitamins",
                price: 200,
                description: "Essential vitamin for bone health and immunity",
                image: "https://images.unsplash.com/photo-1631549916768-4873b991938d?w=300&h=300&fit=crop",
                dosage: "1000IU",
                manufacturer: "Sunpharma",
                stockCount: 200,
                rating: 4.8,
                reviews: 567,
                discount: 12,
                inStock: true,
                quantity: 200,
                date: Date.now()
            },
            {
                name: "Metformin 500mg",
                category: "Diabetes",
                price: 80,
                description: "For diabetes management and blood sugar control",
                image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=300&h=300&fit=crop",
                dosage: "500mg",
                manufacturer: "Intas",
                stockCount: 120,
                rating: 4.5,
                reviews: 298,
                discount: 10,
                requiresPrescription: true,
                inStock: true,
                quantity: 120,
                date: Date.now()
            },
            {
                name: "Lisinopril 10mg",
                category: "Blood Pressure",
                price: 150,
                description: "ACE inhibitor for hypertension management",
                image: "https://images.unsplash.com/photo-1631549916768-4873b991938d?w=300&h=300&fit=crop",
                dosage: "10mg",
                manufacturer: "Astra Zeneca",
                stockCount: 75,
                rating: 4.6,
                reviews: 234,
                discount: 8,
                requiresPrescription: true,
                inStock: true,
                quantity: 75,
                date: Date.now()
            },
            {
                name: "Omeprazole 20mg",
                category: "Stomach",
                price: 95,
                description: "For acid reflux and stomach ulcer treatment",
                image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=300&h=300&fit=crop",
                dosage: "20mg",
                manufacturer: "Dr. Reddys",
                stockCount: 100,
                rating: 4.4,
                reviews: 342,
                discount: 10,
                requiresPrescription: true,
                inStock: true,
                quantity: 100,
                date: Date.now()
            },
            {
                name: "Chlorpheniramine 2mg",
                category: "Allergy",
                price: 35,
                description: "Fast relief from allergies and itching",
                image: "https://images.unsplash.com/photo-1631549916768-4873b991938d?w=300&h=300&fit=crop",
                dosage: "2mg",
                manufacturer: "Alembic",
                stockCount: 180,
                rating: 4.3,
                reviews: 195,
                discount: 15,
                inStock: true,
                quantity: 180,
                date: Date.now()
            },
            {
                name: "Ibuprofen 200mg",
                category: "Pain Relief",
                price: 45,
                description: "Anti-inflammatory pain reliever",
                image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=300&h=300&fit=crop",
                dosage: "200mg",
                manufacturer: "Pfizer",
                stockCount: 140,
                rating: 4.6,
                reviews: 412,
                discount: 12,
                inStock: true,
                quantity: 140,
                date: Date.now()
            },
            {
                name: "Atorvastatin 10mg",
                category: "Cholesterol",
                price: 180,
                description: "For cholesterol management",
                image: "https://images.unsplash.com/photo-1631549916768-4873b991938d?w=300&h=300&fit=crop",
                dosage: "10mg",
                manufacturer: "Ranbaxy",
                stockCount: 90,
                rating: 4.5,
                reviews: 278,
                discount: 8,
                requiresPrescription: true,
                inStock: true,
                quantity: 90,
                date: Date.now()
            },
            {
                name: "Antibiotic Cream",
                category: "Skin Care",
                price: 65,
                description: "For cuts, wounds and minor skin infections",
                image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=300&fit=crop",
                dosage: "15g",
                manufacturer: "Himalaya",
                stockCount: 110,
                rating: 4.7,
                reviews: 356,
                discount: 10,
                inStock: true,
                quantity: 110,
                date: Date.now()
            }
        ]

        const inserted = await medicineModel.insertMany(medicines)
        console.log(`✅ Seeded ${inserted.length} medicines successfully!`)
        process.exit(0)

    } catch (error) {
        console.error('❌ Error seeding medicines:', error.message)
        process.exit(1)
    }
}

seedMedicines()

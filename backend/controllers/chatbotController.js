// Basic AI Chatbot with Logic-based Responses
const MEDICAL_DISCLAIMER = "\n\n⚠️ **Disclaimer:** Always consult a doctor before using any medicine. Take medicines only after proper medical advice.";

const chatbotResponse = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === "") {
            return res.json({ success: false, message: "Message cannot be empty" });
        }

        const msg = message.toLowerCase();
        let reply = "";

        // Health-related responses
        if (msg.includes("fever")) {
            reply = "🌡️ **Fever Management:**\n• Take rest and stay hydrated\n• Drink warm water or herbal tea\n• Take paracetamol (500mg) every 4-6 hours\n• If fever persists above 103°F for 3+ days, consult a doctor immediately\n\n⚠️ **When to see doctor:** High fever with rash, confusion, or difficulty breathing." + MEDICAL_DISCLAIMER;
        } 
        else if (msg.includes("cough") || msg.includes("cold")) {
            reply = "🤧 **Cold & Cough Relief:**\n• Stay hydrated - drink plenty of water\n• Use honey-lemon warm water\n• Take cough syrup (as directed on bottle)\n• Use saline nasal drops for congestion\n• Get 7-8 hours of sleep\n\n💊 **Recommended:** Rest for 3-5 days. Most colds resolve on their own." + MEDICAL_DISCLAIMER;
        } 
        else if (msg.includes("headache")) {
            reply = "🤕 **Headache Treatment:**\n• Rest in a cool, dark room\n• Apply cold/warm compress on forehead\n• Stay hydrated\n• Take paracetamol (500mg) or ibuprofen (200mg)\n• Avoid loud noises and bright lights\n\n⚠️ **See doctor if:** Severe pain, vision changes, or accompanied by fever." + MEDICAL_DISCLAIMER;
        }
        else if (msg.includes("stomach") || msg.includes("gastric") || msg.includes("indigestion")) {
            reply = "🤢 **Stomach & Digestion Issues:**\n• Eat light foods - rice, banana, toast\n• Drink ginger tea or lemon water\n• Take antacid medication\n• Avoid spicy, oily, or heavy foods\n• Don't eat large meals\n\n💊 **Recommended:** Omeprazole or antacid gel for relief." + MEDICAL_DISCLAIMER;
        }
        else if (msg.includes("blood pressure") || msg.includes("bp")) {
            reply = "💓 **Blood Pressure Management:**\n• Reduce salt intake\n• Exercise regularly (30 mins daily)\n• Manage stress with meditation\n• Limit alcohol and caffeine\n• Monitor BP regularly\n\n⚠️ **Consult doctor:** If BP > 180/120 or experiencing dizziness." + MEDICAL_DISCLAIMER;
        }
        else if (msg.includes("diabetes") || msg.includes("blood sugar")) {
            reply = "🩺 **Diabetes Management:**\n• Monitor blood sugar regularly\n• Follow prescribed diet - avoid refined sugars\n• Exercise 30 mins daily\n• Take medications as prescribed\n• Eat fiber-rich foods\n\n⚠️ **Important:** Regular doctor checkups required. Never self-adjust medication." + MEDICAL_DISCLAIMER;
        }
        else if (msg.includes("allergy") || msg.includes("itch") || msg.includes("rash")) {
            reply = "🔴 **Allergy & Skin Issues:**\n• Avoid irritants (soaps, lotions)\n• Keep skin clean and dry\n• Use antihistamine if itching\n• Wear comfortable cotton clothes\n• Apply moisturizer to dry skin\n\n⚠️ **See doctor:** If rash spreads or doesn't improve in 3 days." + MEDICAL_DISCLAIMER;
        }
        else if (msg.includes("appointment") || msg.includes("doctor")) {
            reply = "🏥 **Book an Appointment:**\nYou can book appointments with our doctors through the 'Appointment' section. Choose your preferred date, time, and doctor speciality.\n\n📞 **Quick Support:** Our doctors are available 9 AM - 9 PM daily.";
        }
        else if (msg.includes("medicine") || msg.includes("prescription")) {
            reply = "💊 **About Medicines:**\nYou can order medicines online through our 'Medicines' section. We deliver authentic medicines from licensed pharmacies.\n\n🔒 **Quality Assurance:** All medicines are verified and come with expiry dates." + MEDICAL_DISCLAIMER;
        }
        else if (msg.includes("ambulance")) {
            reply = "🚑 **Ambulance Service:**\nOur 24/7 ambulance service is available for emergency medical situations. Request through 'Ambulance' section.\n\n⏱️ **Response Time:** Average 15 minutes in urban areas.";
        }
        else if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
            reply = "👋 **Welcome to MediConnect AI Assistant!**\n\nI'm here to help you with:\n• Health symptoms and basic guidance\n• Information about our services\n• Appointment and prescription help\n\n💡 **What can I help you with today?**";
        }
        else if (msg.includes("thanks") || msg.includes("thank you")) {
            reply = "😊 **You're Welcome!**\n\nIf you need more help or wish to consult a doctor, feel free to ask or visit our appointment section.\n\n🏥 Stay healthy!";
        }
        else {
            reply = "🤔 **I'm not sure about that.**\n\nPlease tell me your symptoms or health concerns. I can provide basic guidance for:\n• Common illnesses (fever, cough, headache)\n• Chronic conditions\n• Medicine & pharmacy info\n• Appointment booking\n\n⚠️ **Important:** For serious concerns, always consult a real doctor. I provide educational information only." + MEDICAL_DISCLAIMER;
        }

        res.json({ 
            success: true, 
            reply: reply,
            timestamp: new Date()
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { chatbotResponse };

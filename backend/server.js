import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import medicineRouter from "./routes/medicineRoute.js"
import ambulanceRouter from "./routes/ambulanceRoute.js"
import qrRouter from "./routes/qrRoute.js"
import chatbotRouter from "./routes/chatbotRoute.js"
import notificationRouter from "./routes/notificationRoute.js"
import pharmacistRouter from "./routes/pharmacistRoute.js"
import stockRouter from "./routes/stockRoute.js"
import doctorScheduleRouter from "./routes/doctorScheduleRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)
app.use("/api/medicine", medicineRouter)
app.use("/api/ambulance", ambulanceRouter)
app.use("/api/qr", qrRouter)
app.use("/api/chatbot", chatbotRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/pharmacist", pharmacistRouter)
app.use("/api/stock", stockRouter)
app.use("/api/doctor-schedule", doctorScheduleRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

app.listen(port, () => console.log(`Server started on PORT:${port}`))
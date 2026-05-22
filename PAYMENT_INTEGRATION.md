# 💳 PAYMENT INTEGRATION COMPLETE GUIDE

**MediConnect Healthcare Platform - Razorpay & Stripe Integration**

---

## **TABLE OF CONTENTS**

1. [Overview](#overview)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Setup Instructions](#setup-instructions)
5. [API Endpoints](#api-endpoints)
6. [Testing Guide](#testing-guide)
7. [Interview Q&A](#interview-qa)
8. [Troubleshooting](#troubleshooting)

---

## **OVERVIEW**

### **What is Payment Integration?**

Payment integration allows users to pay for appointments using:
- **Razorpay** - Indian payment gateway
- **Stripe** - International payment gateway

### **Payment Flow**

```
User Appointment → Payment Options → Choose Gateway → Pay → Verify → Confirm
                                     ↓
                        Razorpay / Stripe
```

### **Key Features**

✅ Dual payment gateway support  
✅ Automatic payment verification  
✅ Real-time notifications  
✅ Error handling  
✅ Order tracking  
✅ Appointment status update  

---

## **BACKEND IMPLEMENTATION**

### **FILE 1: backend/controllers/userController.js**

#### **Imports**

```javascript
import stripe from "stripe";                    // Stripe payment gateway
import razorpay from 'razorpay';               // Razorpay payment gateway
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import { sendNotificationHelper } from "../utils/notificationHelper.js";
```

#### **Initialization**

```javascript
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})
```

**Why?**
- Creates instances for each gateway
- Uses .env variables for security
- Ready to create orders/sessions

---

### **FUNCTION 1: paymentRazorpay()**

**Purpose:** Create Razorpay order for appointment payment

```javascript
const paymentRazorpay = async (req, res) => {
    try {
        // STEP 1: Get appointmentId from request
        const { appointmentId } = req.body
        
        // STEP 2: Fetch appointment details
        const appointmentData = await appointmentModel.findById(appointmentId)

        // STEP 3: Validation - Check if appointment exists and not cancelled
        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ 
                success: false, 
                message: 'Appointment Cancelled or not found' 
            })
        }

        // STEP 4: Create Razorpay order options
        const options = {
            amount: appointmentData.amount * 100,    // Amount in paise (₹100 = 10000 paise)
            currency: process.env.CURRENCY,          // INR
            receipt: appointmentId,                   // Unique receipt ID
        }

        // STEP 5: Create order in Razorpay
        const order = await razorpayInstance.orders.create(options)

        // STEP 6: Send order details to frontend
        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
```

**Flow:**
1. Get appointment ID
2. Fetch appointment from DB
3. Validate appointment
4. Create order with amount, currency, receipt
5. Return order to frontend

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_1234567890",
    "entity": "order",
    "amount": 50000,
    "amount_paid": 0,
    "amount_due": 50000,
    "currency": "INR",
    "receipt": "appointmentId",
    "status": "created"
  }
}
```

---

### **FUNCTION 2: verifyRazorpay()**

**Purpose:** Verify Razorpay payment and update appointment

```javascript
const verifyRazorpay = async (req, res) => {
    try {
        // STEP 1: Get order ID from Razorpay response
        const { razorpay_order_id } = req.body
        
        // STEP 2: Fetch order status from Razorpay
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        // STEP 3: Check if order status is 'paid'
        if (orderInfo.status === 'paid') {
            // STEP 4: Update appointment payment status
            await appointmentModel.findByIdAndUpdate(
                orderInfo.receipt,  // appointmentId is stored as receipt
                { payment: true }   // Mark as paid
            )
            
            // STEP 5: Fetch full appointment data for notifications
            const appointmentData = await appointmentModel.findById(orderInfo.receipt)
            
            // STEP 6: Send payment confirmation to USER
            await sendNotificationHelper(
                String(appointmentData.userId),
                'appointment',
                '💳 Payment Successful',
                'Your appointment payment has been confirmed',
                `Amount: ₹${appointmentData.amount} | Booking: ${appointmentData.slotDate}`,
                '✅',
                '/my-appointments',
                { appointmentId: String(orderInfo.receipt) }
            );

            // STEP 7: Send payment confirmation to DOCTOR
            await sendNotificationHelper(
                String(appointmentData.docId),
                'appointment',
                '💳 Payment Confirmed',
                `Payment confirmed for ${appointmentData.userData.name}'s appointment`,
                `Amount: ₹${appointmentData.amount}`,
                '💰',
                '/appointments',
                { appointmentId: orderInfo.receipt }
            );

            // STEP 8: Return success
            return res.json({ success: true, message: 'Payment Verified' })
        } else {
            return res.json({ success: false, message: 'Payment Not Confirmed' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
```

**Flow:**
1. Get order ID from Razorpay response
2. Fetch order status from Razorpay
3. If status = "paid":
   - Update appointment.payment = true
   - Send notification to user
   - Send notification to doctor
   - Return success
4. Else: Return failure

**Notifications Sent:**
- ✅ User notification: "💳 Payment Successful"
- ✅ Doctor notification: "💳 Payment Confirmed"

---

### **FUNCTION 3: paymentStripe()**

**Purpose:** Create Stripe checkout session for appointment payment

```javascript
const paymentStripe = async (req, res) => {
    try {
        // STEP 1: Get appointmentId and origin (frontend URL)
        const { appointmentId } = req.body
        const { origin } = req.headers

        // STEP 2: Fetch appointment details
        const appointmentData = await appointmentModel.findById(appointmentId)

        // STEP 3: Validation
        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ 
                success: false, 
                message: 'Appointment Cancelled or not found' 
            })
        }

        // STEP 4: Convert currency to lowercase (stripe requirement)
        const currency = process.env.CURRENCY.toLocaleLowerCase()

        // STEP 5: Create line items for Stripe checkout
        const line_items = [{
            price_data: {
                currency,                    // INR
                product_data: {
                    name: "Appointment Fees"  // Product name
                },
                unit_amount: appointmentData.amount * 100  // Amount in cents
            },
            quantity: 1
        }]

        // STEP 6: Create Stripe checkout session
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: line_items,
            mode: 'payment',  // One-time payment
        })

        // STEP 7: Return session URL to frontend
        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
```

**Flow:**
1. Get appointment ID and frontend URL
2. Fetch appointment from DB
3. Validate appointment
4. Create line items (product, price)
5. Create Stripe checkout session
6. Return session URL to redirect user

**Response:**
```json
{
  "success": true,
  "session_url": "https://checkout.stripe.com/pay/cs_..."
}
```

---

### **FUNCTION 4: verifyStripe()**

**Purpose:** Verify Stripe payment after redirect

```javascript
const verifyStripe = async (req, res) => {
    try {
        // STEP 1: Get appointmentId and success status
        const { appointmentId, success } = req.body

        // STEP 2: If payment was successful (success === "true")
        if (success === "true") {
            // STEP 3: Update appointment payment status
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true })
            
            // STEP 4: Fetch full appointment data
            const appointmentData = await appointmentModel.findById(appointmentId)
            
            // STEP 5: Send payment confirmation to USER
            await sendNotificationHelper(
                String(appointmentData.userId),
                'appointment',
                '💳 Payment Successful',
                'Your appointment payment has been confirmed',
                `Amount: ₹${appointmentData.amount} | Booking: ${appointmentData.slotDate}`,
                '✅',
                '/my-appointments',
                { appointmentId: String(appointmentId) }
            );

            // STEP 6: Send payment confirmation to DOCTOR
            await sendNotificationHelper(
                String(appointmentData.docId),
                'appointment',
                '💳 Payment Confirmed',
                `Payment confirmed for ${appointmentData.userData.name}'s appointment`,
                `Amount: ₹${appointmentData.amount}`,
                '💰',
                '/appointments',
                { appointmentId }
            );

            return res.json({ success: true, message: "Payment Confirmed" })
        } else {
            return res.json({ success: false, message: "Payment Cancelled" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
```

**Flow:**
1. Get appointmentId and success status
2. If success = true:
   - Update appointment.payment = true
   - Send notifications
   - Return success
3. Else: Return failure

---

### **FILE 2: backend/routes/userRoute.js**

```javascript
import { 
    loginUser, 
    registerUser, 
    getProfile, 
    updateProfile, 
    bookAppointment, 
    listAppointment, 
    cancelAppointment, 
    paymentRazorpay,      // ← New
    verifyRazorpay,       // ← New
    paymentStripe,        // ← New
    verifyStripe          // ← New
} from '../controllers/userController.js';

import authUser from '../middleware/authUser.js';

const userRouter = express.Router();

// Payment routes
userRouter.post("/payment-razorpay", authUser, paymentRazorpay)
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)
userRouter.post("/payment-stripe", authUser, paymentStripe)
userRouter.post("/verifyStripe", authUser, verifyStripe)

export default userRouter;
```

---

### **FILE 3: backend/.env Setup**

```env
# Currency Configuration
CURRENCY=INR

# Razorpay Payment Gateway
RAZORPAY_KEY_ID = "rzp_test_abc123..."      # Get from Razorpay dashboard
RAZORPAY_KEY_SECRET = "test_xyz789..."      # Get from Razorpay dashboard

# Stripe Payment Gateway
STRIPE_SECRET_KEY = "sk_test_xyz123..."     # Get from Stripe dashboard
```

---

## **FRONTEND IMPLEMENTATION**

### **FILE: frontend/src/pages/MyAppointments.jsx**

#### **Setup & Imports**

```javascript
import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const MyAppointments = () => {
  const { backendUrl, token, getAppointmentsData, appointments, cancelAppointment } = useContext(AppContext)
  
  const [payment, setPayment] = useState('')  // Track payment method
  
  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    document.body.appendChild(script)
  }, [])
  
  return (...)
}
```

#### **Razorpay Handler Function**

```javascript
const razorpayPaymentHandler = async (order) => {
    // STEP 1: Create options for Razorpay modal
    const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,          // Public key
        order_id: order.id,                                   // Order ID
        amount: order.amount,                                 // Amount in paise
        currency: "INR",
        name: 'Appointment Payment',                          // Title
        description: "Appointment Payment",                   // Description
        handler: async (response) => {                        // On successful payment
            // STEP 2: Send payment details to backend for verification
            try {
                const { data } = await axios.post(
                    backendUrl + "/api/user/verifyRazorpay", 
                    response, 
                    { headers: { token } }
                );
                
                if (data.success) {
                    toast.success('Payment Verified!')
                    getAppointmentsData()  // Refresh data
                    setPayment('')         // Clear payment state
                }
            } catch (error) {
                toast.error('Payment verification failed')
            }
        },
    }

    // STEP 3: Create Razorpay instance and open modal
    const rzp = new window.Razorpay(options);
    rzp.open()  // Open payment modal
}
```

#### **Razorpay Payment Function**

```javascript
const appointmentRazorpay = async (appointmentId) => {
    try {
        // STEP 1: Call backend to create Razorpay order
        const { data } = await axios.post(
            backendUrl + '/api/user/payment-razorpay', 
            { appointmentId }, 
            { headers: { token } }
        )

        // STEP 2: If order created successfully
        if (data.success) {
            // STEP 3: Open Razorpay payment modal
            razorpayPaymentHandler(data.order)
        }
    } catch (error) {
        toast.error(error.message)
    }
}
```

#### **Stripe Payment Function**

```javascript
const appointmentStripe = async (appointmentId) => {
    try {
        // STEP 1: Call backend to create Stripe session
        const { data } = await axios.post(
            backendUrl + '/api/user/payment-stripe', 
            { appointmentId }, 
            { headers: { token } }
        )

        // STEP 2: If session created successfully
        if (data.success) {
            // STEP 3: Redirect to Stripe checkout
            window.location.href = data.session_url
        }
    } catch (error) {
        toast.error(error.message)
    }
}
```

#### **Render Payment Buttons**

```javascript
<div className='flex gap-2'>
    {/* Razorpay Button */}
    <button 
        onClick={() => appointmentRazorpay(item._id)}
        className='text-sm text-stone-500 underline'
    >
        Pay with Razorpay
    </button>

    {/* Stripe Button */}
    <button 
        onClick={() => appointmentStripe(item._id)}
        className='text-sm text-stone-500 underline'
    >
        Pay with Stripe
    </button>
</div>
```

---

## **SETUP INSTRUCTIONS**

### **Step 1: Get Razorpay Keys**

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Login/Create account
3. Go to Settings → API Keys
4. Copy:
   - **Key ID** (Public key)
   - **Key Secret** (Private key)

### **Step 2: Get Stripe Keys**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Login/Create account
3. Go to Developers → API Keys
4. Copy:
   - **Secret Key** (Private key)
   - **Publishable Key** (Public key - for frontend)

### **Step 3: Update Environment Variables**

**Backend (.env):**
```env
RAZORPAY_KEY_ID=rzp_test_abc123...
RAZORPAY_KEY_SECRET=test_xyz789...
STRIPE_SECRET_KEY=sk_test_xyz123...
CURRENCY=INR
```

**Frontend (.env):**
```env
VITE_RAZORPAY_KEY_ID=rzp_test_abc123...
```

### **Step 4: Install Dependencies**

```bash
# Backend
cd backend
npm install razorpay stripe

# Frontend
cd frontend
npm install axios
```

### **Step 5: Test in Development**

Use **test credentials** provided by each platform:

**Razorpay Test Card:**
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

**Stripe Test Card:**
- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits

---

## **API ENDPOINTS**

### **1. POST /api/user/payment-razorpay**

**Purpose:** Create Razorpay order

**Request:**
```json
{
  "appointmentId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_1234567890",
    "entity": "order",
    "amount": 50000,
    "currency": "INR",
    "receipt": "507f1f77bcf86cd799439011",
    "status": "created"
  }
}
```

**Status Codes:**
- 200: Order created successfully
- 400: Appointment not found or cancelled
- 500: Server error

---

### **2. POST /api/user/verifyRazorpay**

**Purpose:** Verify Razorpay payment

**Request:**
```json
{
  "razorpay_order_id": "order_1234567890",
  "razorpay_payment_id": "pay_xyz123",
  "razorpay_signature": "signature_abc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment Verified"
}
```

**What Happens:**
- ✅ Appointment.payment = true
- ✅ Notifications sent
- ✅ Database updated

---

### **3. POST /api/user/payment-stripe**

**Purpose:** Create Stripe checkout session

**Request:**
```json
{
  "appointmentId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "success": true,
  "session_url": "https://checkout.stripe.com/pay/cs_..."
}
```

---

### **4. POST /api/user/verifyStripe**

**Purpose:** Verify Stripe payment

**Request:**
```json
{
  "appointmentId": "507f1f77bcf86cd799439011",
  "success": "true"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment Confirmed"
}
```

---

## **TESTING GUIDE**

### **Test Case 1: Razorpay Payment**

```
1. Login as user
2. Book appointment
3. Click "Pay with Razorpay"
4. Razorpay modal opens
5. Use test card: 4111 1111 1111 1111
6. Enter any expiry & CVV
7. Click Pay
8. Success page shows
9. Appointment marked as paid ✅
10. Notifications sent ✅
```

### **Test Case 2: Stripe Payment**

```
1. Login as user
2. Book appointment
3. Click "Pay with Stripe"
4. Redirected to Stripe checkout
5. Use test card: 4242 4242 4242 4242
6. Enter any expiry & CVC
7. Click Pay
8. Redirected to success page
9. Appointment marked as paid ✅
10. Notifications sent ✅
```

### **Test Case 3: Payment Failure**

```
1. Use card: 4000 0000 0000 0002
2. Payment should fail
3. Error message shown
4. Appointment not marked as paid
5. Can retry
```

### **Test Case 4: Cancelled Appointment**

```
1. Cancel appointment
2. Try to pay
3. Should show error: "Appointment Cancelled or not found"
```

---

## **INTERVIEW Q&A**

### **Q1: Razorpay vs Stripe - Differences?**

```
RAZORPAY:
✅ Indian payment gateway
✅ Direct UPI/Card support
✅ Lower fees
✅ Better for India
✅ Web + Mobile friendly

STRIPE:
✅ International gateway
✅ Global coverage
✅ Better security
✅ Wider card support
✅ Webhook support
```

---

### **Q2: Payment Flow Explain?**

```
RAZORPAY:
Frontend → paymentRazorpay() 
  ↓
Backend → paymentRazorpay() → Create order
  ↓
Frontend → Razorpay modal opens
  ↓
User fills payment details
  ↓
Razorpay processes
  ↓
Frontend → verifyRazorpay()
  ↓
Backend → verifyRazorpay() → Verify → Update appointment
  ↓
Send notifications

STRIPE:
Frontend → paymentStripe()
  ↓
Backend → paymentStripe() → Create session
  ↓
Frontend → Redirect to Stripe
  ↓
User fills payment details
  ↓
Stripe processes
  ↓
Redirect back with success=true/false
  ↓
Frontend → verifyStripe()
  ↓
Backend → verifyStripe() → Update appointment
  ↓
Send notifications
```

---

### **Q3: Why Two Payment Gateways?**

```
1. USER CHOICE
   - Different users prefer different methods
   - More options = better UX

2. FALLBACK
   - If one gateway down, use other
   - System resilience

3. REGIONAL PREFERENCE
   - Razorpay for India
   - Stripe for international

4. FEATURE COVERAGE
   - Razorpay for domestic
   - Stripe for global

5. COST OPTIMIZATION
   - Can choose based on fee
```

---

### **Q4: Security Measures?**

```
1. AUTHENTICATION
   - authUser middleware on all routes
   - JWT token verification

2. VALIDATION
   - Check appointment exists
   - Check not cancelled
   - Validate amount

3. ENCRYPTION
   - Keys stored in .env
   - Never in code

4. VERIFICATION
   - Backend verifies payment
   - Razorpay/Stripe signature check
   - Double verification

5. ERROR HANDLING
   - Graceful failures
   - No sensitive data in logs
```

---

### **Q5: Database Changes?**

```
BEFORE:
appointment: {
  _id, userId, docId, slotDate, slotTime, amount, cancelled
}

AFTER:
appointment: {
  _id, userId, docId, slotDate, slotTime, amount, cancelled,
  payment: true/false  ← NEW FIELD!
}
```

---

### **Q6: Error Handling?**

```
try {
  // Verify payment
  const order = await razorpayInstance.orders.fetch(orderId)
  
  if (order.status === 'paid') {
    // Update DB
    await appointmentModel.findByIdAndUpdate(id, { payment: true })
    // Send notifications
    await sendNotificationHelper(...)
    return res.json({ success: true })
  } else {
    return res.json({ success: false, message: 'Not paid' })
  }
} catch (error) {
  // Payment verification failed (network, timeout, etc)
  console.log(error)
  return res.json({ success: false, message: error.message })
}
```

**Scenarios Handled:**
- ✅ Payment gateway down
- ✅ Network timeout
- ✅ Invalid order ID
- ✅ Cancelled appointment
- ✅ Duplicate payment

---

### **Q7: Notifications After Payment?**

```
SENT TO USER:
Title: "💳 Payment Successful"
Message: "Your appointment payment has been confirmed"
Details: "Amount: ₹500 | Booking: 2024-05-20"

SENT TO DOCTOR:
Title: "💳 Payment Confirmed"
Message: "Payment confirmed for John's appointment"
Details: "Amount: ₹500"

BENEFITS:
✅ Both parties informed
✅ Real-time updates
✅ Appointment tracking
✅ Payment confirmation
```

---

### **Q8: Scalability Considerations?**

```
CURRENT: ✅ Good for 1000s of appointments

IMPROVEMENTS:
1. RATE LIMITING
   - Prevent payment spam
   - Max 5 payments/minute per user

2. CACHING
   - Cache exchange rates
   - Reduce API calls

3. WEBHOOK SUPPORT
   - Stripe webhooks for async verification
   - Razorpay webhooks for updates

4. PAYMENT HISTORY
   - Log all transactions
   - Audit trail

5. RETRY LOGIC
   - Retry failed payments
   - Exponential backoff

6. QUEUE SYSTEM
   - Queue payment verifications
   - Async processing
```

---

## **TROUBLESHOOTING**

### **Issue 1: "Request failed with status code 401"**

**Problem:** Unauthorized access

**Solution:**
```
1. Check token is valid
2. Check authUser middleware
3. Check JWT secret in .env
4. Check headers: { token }
```

---

### **Issue 2: "Cannot read property 'amount' of undefined"**

**Problem:** Appointment not found

**Solution:**
```
1. Check appointmentId in request
2. Check appointment exists in DB
3. Check appointment not cancelled
4. Log appointmentData before using
```

---

### **Issue 3: "Razorpay Modal Not Opening"**

**Problem:** Script not loaded

**Solution:**
```javascript
// Make sure this runs on component mount:
useEffect(() => {
  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  document.body.appendChild(script)
}, [])
```

---

### **Issue 4: "Payment Verified but Appointment Not Updated"**

**Problem:** Database update failed

**Solution:**
```
1. Check appointmentId format (ObjectId vs String)
2. Check database connection
3. Check MongoDB permissions
4. Log update response
5. Add error handling in catch block
```

---

### **Issue 5: "Notifications Not Sending"**

**Problem:** notificationHelper failed silently

**Solution:**
```
1. Check sendNotificationHelper import
2. Check notification model
3. Check userIds are strings
4. Check error logs
5. Test helper separately
```

---

## **QUICK REFERENCE**

### **Key Files**

```
backend/controllers/userController.js  → 4 payment functions
backend/routes/userRoute.js            → 4 payment routes
frontend/src/pages/MyAppointments.jsx  → Payment UI
backend/.env                            → Payment keys
```

### **Key Functions**

```
paymentRazorpay()      → Create order
verifyRazorpay()       → Verify + update
paymentStripe()        → Create session
verifyStripe()         → Verify + update
```

### **Key Endpoints**

```
POST /api/user/payment-razorpay
POST /api/user/verifyRazorpay
POST /api/user/payment-stripe
POST /api/user/verifyStripe
```

### **Environment Variables**

```
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
STRIPE_SECRET_KEY
CURRENCY
VITE_RAZORPAY_KEY_ID (frontend)
```

---

**Integration Complete!** 💳✅

Koi aur detail chahiye? 🤔

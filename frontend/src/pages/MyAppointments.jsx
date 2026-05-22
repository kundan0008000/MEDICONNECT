import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyAppointments = () => {

    const { backendUrl, token } = useContext(AppContext)
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [payment, setPayment] = useState('')
    const [userData, setUserData] = useState(null)

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    }

    // Getting User Appointments Data Using API
    const getUserAppointments = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            setAppointments(data.appointments.reverse())

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Function to cancel appointment Using API
    const cancelAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                getUserAppointments()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    const initPay = (order) => {
        // ✅ DEBUG: Check if Razorpay is loaded
        if (!window.Razorpay) {
            console.error('❌ Razorpay script not loaded!')
            toast.error('Razorpay not loaded. Refresh page.')
            return
        }

        console.log('✅ Razorpay script loaded')
        console.log('✅ Order data:', order)

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Appointment Payment',
            description: "Appointment Payment",
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                console.log('✅ Payment Response:', response)

                try {
                    const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
                    console.log('✅ Verification Response:', data)
                    if (data.success) {
                        toast.success('Payment Successful! ✅')
                        navigate('/my-appointments')
                        getUserAppointments()
                    } else {
                        toast.error(data.message)
                    }
                } catch (error) {
                    console.error('❌ Verification Error:', error)
                    toast.error(error.response?.data?.message || error.message)
                }
            },
            prefill: {
                name: userData?.name || 'User',
                email: userData?.email || 'user@example.com',
                contact: userData?.phone || ''
            },
            theme: {
                color: '#3399cc'
            }
        };

        console.log('✅ Razorpay Options:', options)

        try {
            const rzp = new window.Razorpay(options);
            console.log('✅ Razorpay instance created')
            rzp.open();
        } catch (error) {
            console.error('❌ Razorpay Error:', error)
            toast.error('Payment Error: ' + error.message)
        }
    };

    // Function to make payment using razorpay
    const appointmentRazorpay = async (appointmentId) => {
        console.log('🚀 Starting Razorpay payment for appointment:', appointmentId)
        try {
            console.log('📡 Calling backend /api/user/payment-razorpay')
            const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
            console.log('✅ Backend Response:', data)
            
            if (data.success) {
                console.log('✅ Payment success, initiating Razorpay')
                toast.info('Opening Razorpay...')
                initPay(data.order)
            } else {
                console.error('❌ Backend Error:', data.message)
                toast.error('Error: ' + data.message)
            }
        } catch (error) {
            console.error('❌ API Call Error:', error)
            toast.error(error.response?.data?.message || error.message || 'Payment request failed')
        }
    }

    // Function to make payment using stripe
    const appointmentStripe = async (appointmentId) => {
        console.log('🚀 Starting Stripe payment for appointment:', appointmentId)
        try {
            console.log('📡 Calling backend /api/user/payment-stripe')
            const { data } = await axios.post(backendUrl + '/api/user/payment-stripe', { appointmentId }, { headers: { token } })
            console.log('✅ Stripe Response:', data)
            
            if (data.success) {
                const { session_url } = data
                console.log('✅ Redirecting to Stripe:', session_url)
                toast.info('Redirecting to Stripe...')
                window.location.replace(session_url)
            } else {
                console.error('❌ Stripe Error:', data.message)
                toast.error('Error: ' + data.message)
            }
        } catch (error) {
            console.error('❌ Stripe API Error:', error)
            toast.error(error.response?.data?.message || error.message || 'Stripe request failed')
        }
    }



    useEffect(() => {
        if (token) {
            getUserAppointments()
            // Fetch user profile data
            getProfile()
        }
    }, [token])

    // Get user profile
    const getProfile = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })
            if (data.success) {
                setUserData(data.user)
            }
        } catch (error) {
            console.log('Could not fetch user profile:', error.message)
        }
    }

    return (
        <div>
            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My appointments</p>
            <div className=''>
                {appointments.map((item, index) => (
                    <div key={index} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
                        <div>
                            <img className='w-36 bg-[#EAEFFF]' src={item.docData.image} alt="" />
                        </div>
                        <div className='flex-1 text-sm text-[#5E5E5E]'>
                            <p className='text-[#262626] text-base font-semibold'>{item.docData.name}</p>
                            <p>{item.docData.speciality}</p>
                            <p className='text-[#464646] font-medium mt-1'>Address:</p>
                            <p className=''>{item.docData.address.line1}</p>
                            <p className=''>{item.docData.address.line2}</p>
                            <p className=' mt-1'><span className='text-sm text-[#3C3C3C] font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} |  {item.slotTime}</p>
                        </div>
                        <div></div>
                        <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                            {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && <button onClick={() => setPayment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>}
                            {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && <button onClick={() => appointmentRazorpay(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center gap-2'><span>💳</span> Razorpay</button>}
                            {/* Stripe temporarily disabled - waiting for valid API key */}
                            {!item.cancelled && item.payment && !item.isCompleted && <button className='sm:min-w-48 py-2 border rounded text-[#696969]  bg-[#EAEFFF]'>Paid</button>}

                            {item.isCompleted && <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>}

                            {!item.cancelled && !item.isCompleted && <button onClick={() => cancelAppointment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>}
                            {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyAppointments
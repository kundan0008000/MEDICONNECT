import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointment = () => {

    const { docId } = useParams()
    const { doctors, currencySymbol, backendUrl, token, getDoctosData } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
    }

    const getAvailableSolts = async () => {

        setDocSlots([])

        // getting current date
        let today = new Date()

        for (let i = 0; i < 7; i++) {

            // getting date with index 
            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            // setting end time of the date with index
            let endTime = new Date()
            endTime.setDate(today.getDate() + i)
            endTime.setHours(21, 0, 0, 0)

            // setting hours 
            if (today.getDate() === currentDate.getDate()) {
                currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
                currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
            } else {
                currentDate.setHours(10)
                currentDate.setMinutes(0)
            }

            let timeSlots = [];


            while (currentDate < endTime) {
                let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let day = currentDate.getDate()
                let month = currentDate.getMonth() + 1
                let year = currentDate.getFullYear()

                const slotDate = day + "_" + month + "_" + year
                const slotTime = formattedTime

                const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

                if (isSlotAvailable) {

                    // Add slot to array
                    timeSlots.push({
                        datetime: new Date(currentDate),
                        time: formattedTime
                    })
                }

                // Increment current time by 30 minutes
                currentDate.setMinutes(currentDate.getMinutes() + 30);
            }

            setDocSlots(prev => ([...prev, timeSlots]))

        }

    }

    const bookAppointment = async () => {

        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login')
        }

        // ✅ NEW: Check if slot selected
        if (!slotTime) {
            toast.error('Please select a time slot')
            return
        }

        // ✅ NEW: Check if slots available
        if (!docSlots.length || !docSlots[slotIndex]) {
            toast.error('Please select a valid date')
            return
        }

        const date = docSlots[slotIndex][0].datetime

        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        const slotDate = day + "_" + month + "_" + year

        try {

            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { docId, slotDate, slotTime }, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                getDoctosData()
                navigate('/my-appointments')
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }

    }

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            getAvailableSolts()
        }
    }, [docInfo])

    return docInfo ? (
        <div>

            {/* ---------- Doctor Details ----------- */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div>
                    <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
                </div>

                <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>

                    {/* ----- Doc Info : name, degree, experience ----- */}

                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{docInfo.degree} - {docInfo.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
                    </div>

                    {/* ----- Doc About ----- */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About <img className='w-3' src={assets.info_icon} alt="" /></p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{docInfo.about}</p>
                    </div>

                    {/* ----- Consultation Details ----- */}
                    <div className='mt-6 border-t pt-6'>
                        <p className='text-lg font-semibold text-gray-800 mb-4'>Consultation Information</p>
                        
                        {/* Qualifications & Experience */}
                        <div className='mb-4'>
                            <p className='text-sm font-medium text-gray-700 mb-2'>Qualifications & Experience</p>
                            <ul className='text-sm text-gray-600 space-y-1'>
                                <li>✓ Degree: {docInfo.degree}</li>
                                <li>✓ Specialization: {docInfo.speciality}</li>
                                <li>✓ Experience: {docInfo.experience}</li>
                                <li>✓ Online Consultation Available</li>
                            </ul>
                        </div>

                        {/* Consultation Types */}
                        <div className='mb-4'>
                            <p className='text-sm font-medium text-gray-700 mb-2'>Consultation Types</p>
                            <div className='grid grid-cols-2 gap-2 text-xs text-gray-600'>
                                <div className='border border-gray-300 rounded p-2'>
                                    <p className='font-medium'>Video Consultation</p>
                                    <p>Face-to-face online</p>
                                </div>
                                <div className='border border-gray-300 rounded p-2'>
                                    <p className='font-medium'>Chat Consultation</p>
                                    <p>Text-based advice</p>
                                </div>
                            </div>
                        </div>

                        {/* What to Expect */}
                        <div className='mb-4'>
                            <p className='text-sm font-medium text-gray-700 mb-2'>What to Expect</p>
                            <ul className='text-sm text-gray-600 space-y-1'>
                                <li>• Personalized medical consultation</li>
                                <li>• Detailed health assessment</li>
                                <li>• Professional diagnosis & advice</li>
                                <li>• Prescription if needed</li>
                                <li>• Follow-up recommendations</li>
                            </ul>
                        </div>

                        {/* Preparation Tips */}
                        <div className='mb-4'>
                            <p className='text-sm font-medium text-gray-700 mb-2'>Before Your Consultation</p>
                            <ul className='text-sm text-gray-600 space-y-1'>
                                <li>• Have your medical history ready</li>
                                <li>• Note down your symptoms</li>
                                <li>• List current medications</li>
                                <li>• Test reports if available</li>
                                <li>• Find a quiet location for video call</li>
                                <li>• Ensure good internet connection</li>
                            </ul>
                        </div>

                        {/* Consultation Benefits */}
                        <div className='mb-4'>
                            <p className='text-sm font-medium text-gray-700 mb-2'>Consultation Benefits</p>
                            <ul className='text-sm text-gray-600 space-y-1'>
                                <li>✓ Convenient online appointment</li>
                                <li>✓ Verified medical professional</li>
                                <li>✓ Confidential & secure</li>
                                <li>✓ Quick response time</li>
                                <li>✓ Digital prescription</li>
                            </ul>
                        </div>

                        {/* Important Notes */}
                        <div className='bg-blue-50 border border-blue-200 rounded p-3'>
                            <p className='text-xs font-medium text-blue-900 mb-1'>Important Notes</p>
                            <p className='text-xs text-blue-800'>• Consultations are not a substitute for emergency services</p>
                            <p className='text-xs text-blue-800'>• In case of emergency, please visit nearest hospital</p>
                        </div>
                    </div>

                    <p className='text-gray-600 font-medium mt-6'>Appointment fee: <span className='text-gray-800'>{currencySymbol}{docInfo.fees}</span> </p>
                </div>
            </div>

            {/* Booking slots */}
            <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
                <p >Booking slots</p>
                <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
                    {docSlots.length && docSlots.map((item, index) => (
                        <div onClick={() => setSlotIndex(index)} key={index} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-[#DDDDDD]'}`}>
                            <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                            <p>{item[0] && item[0].datetime.getDate()}</p>
                        </div>
                    ))}
                </div>

                <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
                    {docSlots.length && docSlots[slotIndex].map((item, index) => (
                        <p onClick={() => setSlotTime(item.time)} key={index} className={`text-sm font-light  flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'}`}>{item.time.toLowerCase()}</p>
                    ))}
                </div>

                <button onClick={bookAppointment} className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'>Book an appointment</button>
            </div>

            {/* Listing Releated Doctors */}
            <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
        </div>
    ) : null
}

export default Appointment
import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorScheduleManagement = () => {
    const { aToken } = useContext(AdminContext)
    const [doctors, setDoctors] = useState([])
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [scheduleData, setScheduleData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchDoctors()
    }, [])

    const fetchDoctors = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/doctor/list', {
                headers: { atoken: aToken }
            })
            const data = await response.json()
            if (data.success) {
                setDoctors(data.doctors)
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching doctors:', error)
            setLoading(false)
        }
    }

    const fetchDoctorSchedule = async (docId) => {
        try {
            const response = await fetch(`http://localhost:4000/api/doctor-schedule/availability/${docId}`)
            const data = await response.json()
            if (data.success) {
                setScheduleData(data.availability)
            }
        } catch (error) {
            console.error('Error fetching schedule:', error)
        }
    }

    const handleSelectDoctor = (doctor) => {
        setSelectedDoctor(doctor)
        fetchDoctorSchedule(doctor._id)
    }

    const handleUpdateWorkingHours = async (dayOfWeek, field, value) => {
        if (!scheduleData || !selectedDoctor) return

        const newWorkingHours = { ...scheduleData.workingHours }
        newWorkingHours[dayOfWeek][field] = value

        try {
            const response = await fetch('http://localhost:4000/api/doctor-schedule/update-hours', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token: aToken
                },
                body: JSON.stringify({
                    docId: selectedDoctor._id,
                    workingHours: newWorkingHours
                })
            })
            const data = await response.json()
            if (data.success) {
                setScheduleData({ ...scheduleData, workingHours: newWorkingHours })
                setMessage('✅ Working hours updated successfully')
                setTimeout(() => setMessage(''), 3000)
            }
        } catch (error) {
            setMessage(`❌ Error: ${error.message}`)
        }
    }

    const toggleWorkingDay = async (dayOfWeek) => {
        if (!scheduleData || !selectedDoctor) return

        const newWorkingHours = { ...scheduleData.workingHours }
        newWorkingHours[dayOfWeek].isWorking = !newWorkingHours[dayOfWeek].isWorking

        try {
            const response = await fetch('http://localhost:4000/api/doctor-schedule/update-hours', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    atoken: aToken
                },
                body: JSON.stringify({
                    docId: selectedDoctor._id,
                    workingHours: newWorkingHours
                })
            })
            const data = await response.json()
            if (data.success) {
                setScheduleData({ ...scheduleData, workingHours: newWorkingHours })
            }
        } catch (error) {
            console.error('Error updating working day:', error)
        }
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    return (
        <div className='min-h-screen bg-gray-50 p-8'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-4xl font-bold text-gray-800 mb-2'>Doctor Schedule Management</h1>
                    <p className='text-gray-600'>Manage doctor availability and working hours</p>
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-4 rounded-lg mb-8 ${message.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {message}
                    </div>
                )}

                <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
                    {/* Doctors List */}
                    <div className='bg-white rounded-lg shadow p-6'>
                        <h2 className='text-2xl font-bold text-gray-800 mb-4'>Doctors</h2>

                        {loading ? (
                            <p className='text-gray-600'>Loading...</p>
                        ) : (
                            <div className='space-y-2 max-h-96 overflow-y-auto'>
                                {doctors.map((doctor, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectDoctor(doctor)}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${
                                            selectedDoctor?._id === doctor._id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                    >
                                        <p className='font-semibold'>{doctor.name}</p>
                                        <p className='text-sm'>{doctor.speciality}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Schedule Details */}
                    {scheduleData && selectedDoctor && (
                        <div className='lg:col-span-3 bg-white rounded-lg shadow p-6'>
                            <h2 className='text-2xl font-bold text-gray-800 mb-6'>
                                {scheduleData.doctorName} - Schedule
                            </h2>

                            {/* Doctor Stats */}
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
                                <div className='bg-blue-50 rounded-lg p-4 text-center'>
                                    <p className='text-2xl font-bold text-blue-600'>{scheduleData.todayAppointments}</p>
                                    <p className='text-sm text-gray-600'>Today</p>
                                </div>
                                <div className='bg-green-50 rounded-lg p-4 text-center'>
                                    <p className='text-2xl font-bold text-green-600'>{scheduleData.thisWeekAppointments}</p>
                                    <p className='text-sm text-gray-600'>This Week</p>
                                </div>
                                <div className='bg-purple-50 rounded-lg p-4 text-center'>
                                    <p className='text-2xl font-bold text-purple-600'>{scheduleData.consultationFee}</p>
                                    <p className='text-sm text-gray-600'>Consultation Fee</p>
                                </div>
                                <div className='bg-yellow-50 rounded-lg p-4 text-center'>
                                    <p className='text-2xl font-bold text-yellow-600'>{scheduleData.isAvailable ? '✅' : '❌'}</p>
                                    <p className='text-sm text-gray-600'>Available</p>
                                </div>
                            </div>

                            {/* Working Hours */}
                            <h3 className='text-xl font-bold text-gray-800 mb-4'>Working Hours</h3>
                            <div className='space-y-3'>
                                {days.map((day, idx) => (
                                    <div key={idx} className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
                                        <div className='flex-1'>
                                            <p className='font-semibold text-gray-800 capitalize'>{day}</p>
                                        </div>

                                        {scheduleData.workingHours[day].isWorking ? (
                                            <div className='flex items-center gap-2'>
                                                <input
                                                    type="time"
                                                    value={scheduleData.workingHours[day].start}
                                                    onChange={(e) => handleUpdateWorkingHours(day, 'start', e.target.value)}
                                                    className='px-3 py-2 border rounded-lg text-sm'
                                                />
                                                <span className='text-gray-600'>-</span>
                                                <input
                                                    type="time"
                                                    value={scheduleData.workingHours[day].end}
                                                    onChange={(e) => handleUpdateWorkingHours(day, 'end', e.target.value)}
                                                    className='px-3 py-2 border rounded-lg text-sm'
                                                />
                                            </div>
                                        ) : (
                                            <span className='text-gray-600 font-semibold'>OFF</span>
                                        )}

                                        <button
                                            onClick={() => toggleWorkingDay(day)}
                                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                                scheduleData.workingHours[day].isWorking
                                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                                    : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                                            }`}
                                        >
                                            {scheduleData.workingHours[day].isWorking ? '✅ Working' : '❌ Off'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DoctorScheduleManagement

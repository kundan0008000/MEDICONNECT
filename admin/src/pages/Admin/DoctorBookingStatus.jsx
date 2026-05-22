import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorBookingStatus = () => {
    const { aToken } = useContext(AdminContext)
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBookingStatus()
    }, [])

    const fetchBookingStatus = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/doctor-schedule/booking-status/all', {
                headers: { atoken: aToken }
            })
            const data = await response.json()
            if (data.success) {
                setDoctors(data.doctors)
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching booking status:', error)
            setLoading(false)
        }
    }

    const getDaysUntilColor = (days) => {
        if (days <= 1) return 'text-red-600 font-bold'; // Red: Free today/tomorrow
        if (days <= 3) return 'text-yellow-600 font-bold'; // Yellow: Few days
        return 'text-green-600 font-bold'; // Green: Many days
    }

    const getBookedDaysColor = (days) => {
        if (days === 0) return 'text-green-600'; // Green: No bookings
        if (days <= 3) return 'text-yellow-600'; // Yellow: Few days booked
        if (days <= 7) return 'text-orange-600'; // Orange: Week booked
        return 'text-red-600'; // Red: Heavily booked
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-gray-50 p-8 flex items-center justify-center'>
                <div className='text-gray-600'>Loading doctor booking status...</div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-50 p-8'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-4xl font-bold text-gray-800 mb-2'>Doctor Booking Status</h1>
                    <p className='text-gray-600'>View booking information for all doctors - how many days patients are booked and when they'll be available</p>
                </div>

                {/* Main Table */}
                <div className='bg-white rounded-lg shadow overflow-hidden'>
                    <table className='w-full'>
                        <thead className='bg-blue-600 text-white'>
                            <tr>
                                <th className='px-6 py-3 text-left text-sm font-semibold'>Doctor Name</th>
                                <th className='px-6 py-3 text-left text-sm font-semibold'>Speciality</th>
                                <th className='px-6 py-3 text-center text-sm font-semibold'>Total<br/>Appointments</th>
                                <th className='px-6 py-3 text-center text-sm font-semibold'>Days<br/>Booked</th>
                                <th className='px-6 py-3 text-left text-sm font-semibold'>Next Free Date</th>
                                <th className='px-6 py-3 text-center text-sm font-semibold'>Free In<br/>(Days)</th>
                                <th className='px-6 py-3 text-center text-sm font-semibold'>Status</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                            {doctors.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className='px-6 py-8 text-center text-gray-500'>
                                        No doctors found
                                    </td>
                                </tr>
                            ) : (
                                doctors.map((doctor, idx) => (
                                    <tr key={idx} className='hover:bg-gray-50 transition-colors'>
                                        <td className='px-6 py-4 font-semibold text-gray-800'>{doctor.name}</td>
                                        <td className='px-6 py-4 text-gray-600'>{doctor.speciality}</td>
                                        <td className='px-6 py-4 text-center'>
                                            <span className='inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold'>
                                                {doctor.totalAppointments}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-center font-bold ${getBookedDaysColor(doctor.bookedDays)}`}>
                                            {doctor.bookedDays} days
                                        </td>
                                        <td className='px-6 py-4'>
                                            <span className='inline-block bg-gray-100 px-3 py-1 rounded-full text-sm font-medium'>
                                                {new Date(doctor.nextFreeDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-center ${getDaysUntilColor(doctor.daysUntilFree)}`}>
                                            {doctor.daysUntilFree === 0 ? 'TODAY ⏱️' : 
                                             doctor.daysUntilFree === 1 ? 'Tomorrow 📅' : 
                                             `${doctor.daysUntilFree} days`}
                                        </td>
                                        <td className='px-6 py-4 text-center'>
                                            {doctor.bookedDays === 0 ? (
                                                <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700'>
                                                    ✅ Available
                                                </span>
                                            ) : doctor.daysUntilFree <= 1 ? (
                                                <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700'>
                                                    ⚠️ Nearly Free
                                                </span>
                                            ) : (
                                                <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700'>
                                                    🔄 Booked
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary Stats */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
                    <div className='bg-white rounded-lg shadow p-6 border-l-4 border-green-500'>
                        <p className='text-gray-600 text-sm'>Available Doctors</p>
                        <p className='text-3xl font-bold text-green-600'>
                            {doctors.filter(d => d.bookedDays === 0).length}
                        </p>
                    </div>
                    <div className='bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500'>
                        <p className='text-gray-600 text-sm'>Fully Booked (Next 7 days)</p>
                        <p className='text-3xl font-bold text-yellow-600'>
                            {doctors.filter(d => d.bookedDays > 3).length}
                        </p>
                    </div>
                    <div className='bg-white rounded-lg shadow p-6 border-l-4 border-blue-500'>
                        <p className='text-gray-600 text-sm'>Total Appointments</p>
                        <p className='text-3xl font-bold text-blue-600'>
                            {doctors.reduce((sum, d) => sum + d.totalAppointments, 0)}
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8'>
                    <h3 className='font-bold text-blue-900 mb-3'>📋 Information:</h3>
                    <ul className='space-y-2 text-gray-700 text-sm'>
                        <li><span className='font-semibold'>Days Booked:</span> How many days are appointments booked</li>
                        <li><span className='font-semibold'>Next Free Date:</span> When will the doctor be available next</li>
                        <li><span className='font-semibold'>Free In (Days):</span> After how many days will be available for new patients</li>
                        <li className='text-red-600'><span className='font-semibold'>🔴 Red:</span> Available today or tomorrow (Urgent)</li>
                        <li className='text-yellow-600'><span className='font-semibold'>🟡 Yellow:</span> Free in a few days</li>
                        <li className='text-green-600'><span className='font-semibold'>🟢 Green:</span> Free after many days or completely available</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default DoctorBookingStatus

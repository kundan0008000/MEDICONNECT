import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const DoctorAvailability = () => {
    const navigate = useNavigate()
    const [doctors, setDoctors] = useState([])
    const [filteredDoctors, setFilteredDoctors] = useState([])
    const [searchSpeciality, setSearchSpeciality] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDoctorAvailability()
    }, [])

    const fetchDoctorAvailability = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/doctor-schedule/all-availability')
            const data = await response.json()
            
            if (data.success) {
                setDoctors(data.doctors)
                setFilteredDoctors(data.doctors)
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching doctor availability:', error)
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase()
        setSearchSpeciality(value)

        if (value === '') {
            setFilteredDoctors(doctors)
        } else {
            setFilteredDoctors(doctors.filter(doc => 
                doc.speciality.toLowerCase().includes(value) ||
                doc.name.toLowerCase().includes(value)
            ))
        }
    }

    const handleBookAppointment = (docId) => {
        navigate(`/appointment/${docId}`)
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='text-center mb-12'>
                    <h1 className='text-4xl font-bold text-gray-800 mb-4'>Doctor Availability</h1>
                    <p className='text-gray-600 text-lg'>Check doctor availability and book appointments</p>
                </div>

                {/* Search Bar */}
                <div className='mb-8'>
                    <input
                        type="text"
                        placeholder='Search by speciality or doctor name...'
                        value={searchSpeciality}
                        onChange={handleSearch}
                        className='w-full px-6 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg'
                    />
                </div>

                {/* Loading State */}
                {loading && (
                    <div className='flex justify-center items-center h-64'>
                        <div className='text-center'>
                            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
                            <p className='mt-4 text-gray-600'>Loading doctor availability...</p>
                        </div>
                    </div>
                )}

                {/* Doctors Grid */}
                {!loading && (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {filteredDoctors.length > 0 ? filteredDoctors.map((doctor, idx) => (
                            <div key={idx} className='bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6'>
                                {/* Doctor Info */}
                                <div className='mb-4'>
                                    <h3 className='text-2xl font-bold text-gray-800 mb-1'>{doctor.name}</h3>
                                    <p className='text-blue-600 font-semibold mb-2'>{doctor.speciality}</p>
                                    <p className='text-gray-600 text-sm'>Consultation Fee: <span className='font-bold text-green-600'>Rs {doctor.consultationFee}</span></p>
                                </div>

                                {/* Availability Stats */}
                                <div className='bg-blue-50 rounded-lg p-4 mb-4 grid grid-cols-2 gap-4'>
                                    <div className='text-center'>
                                        <p className='text-2xl font-bold text-blue-600'>{doctor.totalBookedAppointments}</p>
                                        <p className='text-gray-600 text-xs'>Total Bookings</p>
                                    </div>
                                    <div className='text-center'>
                                        <p className='text-2xl font-bold text-green-600'>{doctor.nextAvailable}</p>
                                        <p className='text-gray-600 text-xs'>Next Available</p>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className='mb-6'>
                                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                                        doctor.totalBookedAppointments < 10
                                            ? 'bg-green-100 text-green-800'
                                            : doctor.totalBookedAppointments < 20
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {doctor.totalBookedAppointments < 10
                                            ? '✅ Available'
                                            : doctor.totalBookedAppointments < 20
                                            ? '⏳ Busy'
                                            : '❌ Very Busy'}
                                    </span>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => handleBookAppointment(doctor._id)}
                                    className='w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all'
                                >
                                    Book Appointment
                                </button>
                            </div>
                        )) : (
                            <div className='col-span-full text-center py-12'>
                                <p className='text-gray-600 text-lg'>No doctors found matching your search</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Summary Stats */}
                {!loading && doctors.length > 0 && (
                    <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-lg shadow-lg p-8'>
                        <div className='text-center border-r'>
                            <p className='text-3xl font-bold text-blue-600'>{doctors.length}</p>
                            <p className='text-gray-600'>Total Doctors</p>
                        </div>
                        <div className='text-center border-r'>
                            <p className='text-3xl font-bold text-green-600'>
                                {doctors.reduce((sum, d) => sum + d.totalBookedAppointments, 0)}
                            </p>
                            <p className='text-gray-600'>Total Appointments</p>
                        </div>
                        <div className='text-center'>
                            <p className='text-3xl font-bold text-purple-600'>
                                Rs {doctors.reduce((sum, d) => sum + d.consultationFee, 0)}
                            </p>
                            <p className='text-gray-600'>Total Fee Range</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DoctorAvailability

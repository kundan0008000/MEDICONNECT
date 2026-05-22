import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AddDoctor = () => {

    const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState(0)
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')

    const { backendUrl } = useContext(AppContext)
    const { aToken } = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {

            if (!docImg) {
                return toast.error('Image Not Selected')
            }

            if (!fees || fees < 1) {
                return toast.error('Please enter valid fees')
            }

            const formData = new FormData();

            formData.append('image', docImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('experience', experience)
            formData.append('fees', String(parseInt(fees)))
            formData.append('about', about)
            formData.append('speciality', speciality)
            formData.append('degree', degree)
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

            // console log formdata            
            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });

            const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                setDocImg(false)
                setName('')
                setPassword('')
                setEmail('')
                setAddress1('')
                setAddress2('')
                setDegree('')
                setAbout('')
                setFees(0)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>

            <p className='mb-3 text-lg font-medium'>Add Doctor</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                
                {/* Image Upload Section */}
                <div className='mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-3 border-dashed border-blue-300 rounded-xl'>
                    <div className='flex items-center gap-6'>
                        {/* Image Preview */}
                        <div className='flex-shrink-0'>
                            <label htmlFor="doc-img" className='cursor-pointer block'>
                                {docImg ? (
                                    <div className='relative'>
                                        <img 
                                            className='w-32 h-32 rounded-xl object-cover border-4 border-primary shadow-lg hover:shadow-xl transition' 
                                            src={URL.createObjectURL(docImg)} 
                                            alt="Doctor Preview" 
                                        />
                                        <div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-xl flex items-center justify-center transition'>
                                            <p className='text-white text-sm font-semibold opacity-0 hover:opacity-100'>Change Photo</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='w-32 h-32 bg-white rounded-xl flex items-center justify-center cursor-pointer border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition shadow'>
                                        <div className='text-center'>
                                            <p className='text-4xl mb-1'>📸</p>
                                            <p className='text-xs text-gray-600'>Click to upload</p>
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>
                        
                        {/* Upload Info */}
                        <div className='flex-1'>
                            <p className='font-bold text-gray-900 mb-2 text-lg'>Upload Doctor Photo</p>
                            <p className='text-sm text-gray-700 mb-4 leading-relaxed'>
                                Choose a professional photo of the doctor. This image will be displayed on the platform.
                            </p>
                            <label htmlFor="doc-img" className='inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:from-blue-600 hover:to-indigo-700 transition font-semibold shadow-md hover:shadow-lg'>
                                📁 Choose Photo
                            </label>
                            {docImg && (
                                <p className='text-sm text-green-600 mt-3 font-semibold'>
                                    ✅ Photo selected: {docImg.name}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <input 
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setDocImg(e.target.files[0]);
                                toast.success('Photo selected: ' + e.target.files[0].name);
                            }
                        }} 
                        type="file" 
                        id="doc-img" 
                        hidden 
                        accept="image/*"
                    />
                </div>

                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Your name</p>
                            <input onChange={e => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Doctor Email</p>
                            <input onChange={e => setEmail(e.target.value)} value={email} className='border rounded px-3 py-2' type="email" placeholder='Email' required />
                        </div>


                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Set Password</p>
                            <input onChange={e => setPassword(e.target.value)} value={password} className='border rounded px-3 py-2' type="password" placeholder='Password' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Experience</p>
                            <select onChange={e => setExperience(e.target.value)} value={experience} className='border rounded px-2 py-2' >
                                <option value="1 Year">1 Year</option>
                                <option value="2 Year">2 Years</option>
                                <option value="3 Year">3 Years</option>
                                <option value="4 Year">4 Years</option>
                                <option value="5 Year">5 Years</option>
                                <option value="6 Year">6 Years</option>
                                <option value="8 Year">8 Years</option>
                                <option value="9 Year">9 Years</option>
                                <option value="10 Year">10 Years</option>
                            </select>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Fees</p>
                            <input 
                                onChange={e => {
                                    const value = e.target.value;
                                    setFees(value === '' ? '' : parseInt(value));
                                }} 
                                value={fees} 
                                className='border rounded px-3 py-2' 
                                type="number" 
                                placeholder='Doctor fees' 
                                min="1"
                                required 
                            />
                            {fees && <p className='text-xs text-gray-500 mt-1'>Fees: ₹{fees}</p>}
                        </div>

                    </div>

                    <div className='w-full lg:flex-1 flex flex-col gap-4'>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Speciality</p>
                            <select onChange={e => setSpeciality(e.target.value)} value={speciality} className='border rounded px-2 py-2'>
                                <option value="General physician">General physician</option>
                                <option value="Gynecologist">Gynecologist</option>
                                <option value="Dermatologist">Dermatologist</option>
                                <option value="Pediatricians">Pediatricians</option>
                                <option value="Neurologist">Neurologist</option>
                                <option value="Gastroenterologist">Gastroenterologist</option>
                            </select>
                        </div>


                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Degree</p>
                            <input onChange={e => setDegree(e.target.value)} value={degree} className='border rounded px-3 py-2' type="text" placeholder='Degree' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Address</p>
                            <input onChange={e => setAddress1(e.target.value)} value={address1} className='border rounded px-3 py-2' type="text" placeholder='Address 1' required />
                            <input onChange={e => setAddress2(e.target.value)} value={address2} className='border rounded px-3 py-2' type="text" placeholder='Address 2' required />
                        </div>

                    </div>

                </div>

                <div>
                    <p className='mt-4 mb-2'>About Doctor</p>
                    <textarea onChange={e => setAbout(e.target.value)} value={about} className='w-full px-4 pt-2 border rounded' rows={5} placeholder='write about doctor'></textarea>
                </div>

                <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>Add doctor</button>

            </div>


        </form>
    )
}

export default AddDoctor
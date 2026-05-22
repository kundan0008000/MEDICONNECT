import axios from 'axios'
import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'

const Login = () => {

  const [state, setState] = useState('Admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (state === 'Admin') {

      const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
      if (data.success) {
        setAToken(data.token)
        localStorage.setItem('aToken', data.token)
        toast.success('Admin Login Successful')
      } else {
        toast.error(data.message)
      }

    } else {

      const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
      if (data.success) {
        setDToken(data.token)
        localStorage.setItem('dToken', data.token)
        toast.success('Doctor Login Successful')
      } else {
        toast.error(data.message)
      }

    }

  }

  const fillDemoCredentials = () => {
    setEmail('doctor@example.com')
    setPassword('password123')
    toast.info('Demo credentials filled. Please create this doctor first from Admin panel.')
  }

  const fillAdminCredentials = () => {
    setEmail('admin@example.com')
    setPassword('kundan123')
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'><span className='text-primary'>{state}</span> Login</p>
        
        <div className='w-full '>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required />
        </div>
        <div className='w-full '>
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
        </div>

        {/* Demo Credentials Button */}
        <button type='button' onClick={state === 'Admin' ? fillAdminCredentials : fillDemoCredentials} className='text-xs text-primary underline cursor-pointer w-full text-center py-1 bg-gray-100 rounded'>
          {state === 'Admin' ? 'Fill Admin Demo' : 'Fill Doctor Demo'}
        </button>

        <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>

        {/* Login Type Toggle */}
        {
          state === 'Admin'
            ? <p className='w-full text-center'>Doctor Login? <span onClick={() => { setState('Doctor'); setEmail(''); setPassword(''); }} className='text-primary underline cursor-pointer'>Click here</span></p>
            : <p className='w-full text-center'>Admin Login? <span onClick={() => { setState('Admin'); setEmail(''); setPassword(''); }} className='text-primary underline cursor-pointer'>Click here</span></p>
        }

        {/* Info Box */}
        <div className='w-full bg-blue-50 border border-blue-200 rounded p-3 text-xs'>
          <p className='font-semibold text-blue-900 mb-2'>Login Information:</p>
          {state === 'Admin' ? (
            <>
              <p className='text-blue-800'>Admin Email: admin@example.com</p>
              <p className='text-blue-800'>Password: kundan123</p>
            </>
          ) : (
            <>
              <p className='text-blue-800'>Doctor Email: doctor@example.com</p>
              <p className='text-blue-800'>Password: password123</p>
              <p className='text-blue-700 mt-2'><strong>Note:</strong> Add doctor from Admin panel first</p>
            </>
          )}
        </div>
      </div>
    </form>
  )
}

export default Login
import React, { useContext, useState, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AdminProfile = () => {

  const { aToken, backendUrl, setAToken } = useContext(AdminContext)

  const [adminData, setAdminData] = useState(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showChangeEmail, setShowChangeEmail] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  })

  // Get admin profile
  const getAdminProfile = async () => {
    try {
      setLoading(true)
      const url = backendUrl + '/api/admin/profile'
      console.log('📍 Profile API URL:', url)
      console.log('🔑 Token:', aToken?.substring(0, 20) + '...')
      
      const { data } = await axios.post(
        url,
        {},
        { headers: { atoken: aToken } }
      )

      if (data.success) {
        setAdminData(data.admin)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log('❌ Profile Error:', error)
      console.log('📋 Error Response:', error.response?.data)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (aToken) {
      getAdminProfile()
    }
  }, [aToken])

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault()

    // Validation
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All fields are required')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      const { data } = await axios.post(
        backendUrl + '/api/admin/change-password',
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        },
        { headers: { atoken: aToken } }
      )

      if (data.success) {
        toast.success(data.message)
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
        setShowChangePassword(false)
        // If password changed, user needs to re-login
        setTimeout(() => {
          setAToken('')
          localStorage.removeItem('aToken')
          window.location.href = '/admin-login'
        }, 2000)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle change email
  const handleChangeEmail = async (e) => {
    e.preventDefault()

    // Validation
    if (!emailForm.newEmail || !emailForm.password) {
      toast.error('Email and password are required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailForm.newEmail)) {
      toast.error('Please enter a valid email')
      return
    }

    try {
      setLoading(true)
      const { data } = await axios.post(
        backendUrl + '/api/admin/change-email',
        {
          newEmail: emailForm.newEmail,
          password: emailForm.password
        },
        { headers: { atoken: aToken } }
      )

      if (data.success) {
        toast.success(data.message)
        setEmailForm({ newEmail: '', password: '' })
        setShowChangeEmail(false)
        // Re-login with new email
        setTimeout(() => {
          setAToken('')
          localStorage.removeItem('aToken')
          window.location.href = '/admin-login'
        }, 2000)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='m-5'>
      <p className='mb-3 text-lg font-medium'>Admin Profile</p>

      {loading && !adminData ? (
        <div className='bg-white p-6 rounded border border-gray-100'>
          <p className='text-gray-500'>Loading...</p>
        </div>
      ) : adminData ? (
        <div className='grid gap-6'>
          {/* Profile Info Card */}
          <div className='bg-white rounded border border-gray-100 p-6'>
            <p className='font-semibold mb-4 flex items-center gap-2'>
              <span className='text-blue-600'>👤</span> Profile Information
            </p>

            <div className='space-y-3'>
              <div className='flex justify-between items-center py-2 px-4 bg-gray-50 rounded'>
                <span className='text-gray-600'>Name:</span>
                <span className='font-medium'>{adminData.name || 'Admin'}</span>
              </div>

              <div className='flex justify-between items-center py-2 px-4 bg-gray-50 rounded'>
                <span className='text-gray-600'>Email:</span>
                <span className='font-medium'>{adminData.email}</span>
              </div>

              <div className='flex justify-between items-center py-2 px-4 bg-gray-50 rounded'>
                <span className='text-gray-600'>Type:</span>
                <span className='font-medium capitalize'>
                  {adminData.type === 'main' ? (
                    <span className='bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm'>Main Admin</span>
                  ) : (
                    <span className='bg-green-100 text-green-700 px-3 py-1 rounded text-sm'>User Admin</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className='bg-white rounded border border-gray-100 p-6'>
            <div className='flex justify-between items-center mb-4'>
              <p className='font-semibold flex items-center gap-2'>
                <span className='text-blue-600'>🔐</span> Security
              </p>
              {!showChangePassword && (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className='text-sm bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600'
                >
                  Change Password
                </button>
              )}
            </div>

            {showChangePassword && (
              <form onSubmit={handleChangePassword} className='space-y-3'>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>Old Password</label>
                  <input
                    type='password'
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
                    placeholder='Enter your old password'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>New Password</label>
                  <input
                    type='password'
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
                    placeholder='Enter new password (min 6 characters)'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>Confirm Password</label>
                  <input
                    type='password'
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
                    placeholder='Confirm new password'
                    required
                  />
                </div>

                <div className='flex gap-2 pt-2'>
                  <button
                    type='submit'
                    disabled={loading}
                    className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50'
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setShowChangePassword(false)
                      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                    className='bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change Email Card */}
          <div className='bg-white rounded border border-gray-100 p-6'>
            <div className='flex justify-between items-center mb-4'>
              <p className='font-semibold flex items-center gap-2'>
                <span className='text-blue-600'>📧</span> Email Settings
              </p>
              {!showChangeEmail && (
                <button
                  onClick={() => setShowChangeEmail(true)}
                  className='text-sm bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600'
                >
                  Change Email
                </button>
              )}
            </div>

            {showChangeEmail && (
              <form onSubmit={handleChangeEmail} className='space-y-3'>
                <div>
                  <label className='block text-sm text-gray-600 mb-1'>New Email</label>
                  <input
                    type='email'
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
                    placeholder='Enter new email address'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm text-gray-600 mb-1'>Confirm Password</label>
                  <input
                    type='password'
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                    className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
                    placeholder='Enter your password to confirm'
                    required
                  />
                </div>

                <div className='flex gap-2 pt-2'>
                  <button
                    type='submit'
                    disabled={loading}
                    className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50'
                  >
                    {loading ? 'Updating...' : 'Update Email'}
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setShowChangeEmail(false)
                      setEmailForm({ newEmail: '', password: '' })
                    }}
                    className='bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Info Box */}
          <div className='bg-yellow-50 border border-yellow-200 rounded p-4'>
            <p className='text-sm text-yellow-800'>
              <strong>ℹ️ Note:</strong> After changing your password or email, you will need to log in again with your new credentials.
            </p>
          </div>
        </div>
      ) : (
        <div className='bg-white p-6 rounded border border-gray-100'>
          <p className='text-red-500'>Failed to load profile. Please try again.</p>
        </div>
      )}
    </div>
  )
}

export default AdminProfile

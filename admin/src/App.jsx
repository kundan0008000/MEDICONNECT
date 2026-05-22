import React, { useContext } from 'react'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import Payments from './pages/Admin/Payments';
import Notifications from './pages/Admin/Notifications';
import DoctorAvailability from './pages/Admin/DoctorAvailability';
import AdminProfile from './pages/Admin/AdminProfile';
import VideoConsultations from './pages/Admin/VideoConsultations';
import StockManagement from './pages/Admin/StockManagement';
import DoctorScheduleManagement from './pages/Admin/DoctorScheduleManagement';
import DoctorBookingStatus from './pages/Admin/DoctorBookingStatus';
import Login from './pages/Login';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';

const App = () => {

  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)

  return dToken || aToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllAppointments />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctor-list' element={<DoctorsList />} />
          <Route path='/admin/payments' element={<Payments />} />
          <Route path='/admin/notifications' element={<Notifications />} />
          <Route path='/admin/doctor-availability' element={<DoctorAvailability />} />
          <Route path='/admin/stock-management' element={<StockManagement />} />
          <Route path='/admin/doctor-schedule' element={<DoctorScheduleManagement />} />
          <Route path='/admin/doctor-booking-status' element={<DoctorBookingStatus />} />
          <Route path='/admin/profile' element={<AdminProfile />} />
          <Route path='/admin/video-consultations' element={<VideoConsultations />} />
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <ToastContainer />
      <Login />
    </>
  )
}

export default App
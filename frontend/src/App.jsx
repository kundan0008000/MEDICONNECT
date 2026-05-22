import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import Medicines from './pages/Medicines'
import AmbulanceRequests from './pages/AmbulanceRequests'
import QRPrescription from './pages/QRPrescription'
import Notifications from './pages/Notifications'
import DoctorAvailability from './pages/DoctorAvailability'
import Chatbot from './components/Chatbot'

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer />
      <Navbar />
      <Chatbot />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/doctor-availability' element={<DoctorAvailability />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/appointment/:docId' element={<Appointment />} />
        <Route path='/my-appointments' element={<MyAppointments />} />
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/verify' element={<Verify />} />
        <Route path='/medicines' element={<Medicines />} />
        <Route path='/ambulance' element={<AmbulanceRequests />} />
        <Route path='/prescription' element={<QRPrescription />} />
        <Route path='/notifications' element={<Notifications />} />
      </Routes>
      <Footer />
      <Chatbot />
    </div>
  )
}

export default App
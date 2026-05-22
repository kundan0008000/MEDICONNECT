import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const About = () => {
  const navigate = useNavigate()
  
  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white'>
      
      {/* Hero Section */}
      <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white py-12 px-4'>
        <div className='max-w-6xl mx-auto text-center'>
          <h1 className='text-4xl md:text-5xl font-bold mb-4'>About MediConnect</h1>
          <p className='text-lg text-blue-100'>Revolutionizing Healthcare, One Appointment at a Time</p>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-12'>
        
        {/* About Section */}
        <section className='mb-16'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div>
              <img className='w-full rounded-lg shadow-lg' src={assets.about_image} alt="About MediConnect" />
            </div>
            <div className='space-y-4'>
              <h2 className='text-3xl font-bold text-gray-800 mb-6'>Our Story</h2>
              <p className='text-gray-700 leading-relaxed'>
                MediConnect was founded in 2024 with a mission to transform healthcare accessibility. We recognized that millions of people struggle with scheduling doctor appointments, managing prescriptions, and accessing quality medical services.
              </p>
              <p className='text-gray-700 leading-relaxed'>
                Today, MediConnect has grown into a comprehensive healthcare platform serving thousands of patients and healthcare providers. We leverage cutting-edge technology to bridge the gap between patients and doctors, making healthcare more accessible, affordable, and efficient.
              </p>
              <div className='bg-blue-50 border-l-4 border-blue-500 p-4 mt-6'>
                <p className='text-blue-900 font-semibold'>
                  "Our commitment is to make healthcare accessible to everyone, everywhere, at any time."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className='mb-16'>
          <h2 className='text-3xl font-bold text-gray-800 text-center mb-12'>Our Foundation</h2>
          <div className='grid md:grid-cols-3 gap-8'>
            {/* Mission */}
            <div className='bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition'>
              <div className='text-4xl mb-4'>🎯</div>
              <h3 className='text-xl font-bold text-gray-800 mb-3'>Our Mission</h3>
              <p className='text-gray-700'>
                To provide a seamless, user-friendly platform that connects patients with healthcare professionals, making medical services accessible and affordable for everyone.
              </p>
            </div>

            {/* Vision */}
            <div className='bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition'>
              <div className='text-4xl mb-4'>🔮</div>
              <h3 className='text-xl font-bold text-gray-800 mb-3'>Our Vision</h3>
              <p className='text-gray-700'>
                To create a world where quality healthcare is just a click away. We envision a future where technology empowers both patients and doctors for better health outcomes.
              </p>
            </div>

            {/* Values */}
            <div className='bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition'>
              <div className='text-4xl mb-4'>💎</div>
              <h3 className='text-xl font-bold text-gray-800 mb-3'>Our Values</h3>
              <p className='text-gray-700'>
                We believe in integrity, innovation, and inclusivity. Our values guide every decision we make and every feature we build.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className='mb-16'>
          <h2 className='text-3xl font-bold text-gray-800 text-center mb-12'>Why Choose MediConnect?</h2>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='border-l-4 border-blue-500 bg-blue-50 p-6 rounded'>
              <h3 className='font-bold text-lg text-gray-800 mb-3'>⚡ Efficiency</h3>
              <p className='text-gray-700'>Streamlined appointment scheduling that fits into your busy lifestyle. Book in seconds, not hours.</p>
            </div>
            <div className='border-l-4 border-green-500 bg-green-50 p-6 rounded'>
              <h3 className='font-bold text-lg text-gray-800 mb-3'>🌍 Convenience</h3>
              <p className='text-gray-700'>Access to a network of trusted healthcare professionals in your area, 24/7 support available.</p>
            </div>
            <div className='border-l-4 border-purple-500 bg-purple-50 p-6 rounded'>
              <h3 className='font-bold text-lg text-gray-800 mb-3'>👤 Personalization</h3>
              <p className='text-gray-700'>Tailored recommendations and reminders to help you stay on top of your health journey.</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className='mb-16'>
          <h2 className='text-3xl font-bold text-gray-800 text-center mb-12'>Our Features</h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='text-center'>
              <div className='text-5xl mb-4'>👨‍⚕️</div>
              <h4 className='font-bold text-gray-800 mb-2'>Expert Doctors</h4>
              <p className='text-gray-600 text-sm'>Access verified healthcare professionals</p>
            </div>
            <div className='text-center'>
              <div className='text-5xl mb-4'>💊</div>
              <h4 className='font-bold text-gray-800 mb-2'>Online Medicines</h4>
              <p className='text-gray-600 text-sm'>Order medicines with easy delivery</p>
            </div>
            <div className='text-center'>
              <div className='text-5xl mb-4'>🚑</div>
              <h4 className='font-bold text-gray-800 mb-2'>Ambulance Service</h4>
              <p className='text-gray-600 text-sm'>24/7 emergency ambulance available</p>
            </div>
            <div className='text-center'>
              <div className='text-5xl mb-4'>📋</div>
              <h4 className='font-bold text-gray-800 mb-2'>QR Prescriptions</h4>
              <p className='text-gray-600 text-sm'>Digital prescriptions with QR codes</p>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className='mb-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-12'>
          <h2 className='text-3xl font-bold text-center mb-12'>MediConnect by Numbers</h2>
          <div className='grid md:grid-cols-4 gap-8 text-center'>
            <div>
              <div className='text-4xl font-bold mb-2'>50K+</div>
              <p className='text-blue-100'>Happy Patients</p>
            </div>
            <div>
              <div className='text-4xl font-bold mb-2'>500+</div>
              <p className='text-blue-100'>Expert Doctors</p>
            </div>
            <div>
              <div className='text-4xl font-bold mb-2'>100K+</div>
              <p className='text-blue-100'>Appointments Booked</p>
            </div>
            <div>
              <div className='text-4xl font-bold mb-2'>95%</div>
              <p className='text-blue-100'>Satisfaction Rate</p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className='mb-16'>
          <h2 className='text-3xl font-bold text-gray-800 text-center mb-12'>Our Leadership Team</h2>
          <div className='grid md:grid-cols-3 gap-8'>
            {[
              { name: 'Dr. Rajesh Kumar', role: 'Founder & CEO', specialty: 'Healthcare Innovator' },
              { name: 'Priya Sharma', role: 'CTO', specialty: 'Tech Lead' },
              { name: 'Amit Patel', role: 'Medical Director', specialty: 'Chief Physician' }
            ].map((member, index) => (
              <div key={index} className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition'>
                <div className='bg-gradient-to-r from-blue-400 to-blue-500 h-40'></div>
                <div className='p-6 text-center'>
                  <h3 className='text-lg font-bold text-gray-800 mb-1'>{member.name}</h3>
                  <p className='text-blue-600 font-semibold mb-2'>{member.role}</p>
                  <p className='text-gray-600 text-sm'>{member.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-gray-800 mb-6'>Ready to Transform Your Healthcare?</h2>
          <p className='text-gray-700 mb-8 max-w-2xl mx-auto'>
            Join thousands of satisfied patients who have already experienced better healthcare with MediConnect.
          </p>
          <button 
            onClick={() => navigate('/doctors')}
            className='bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition'
          >
            Get Started Today
          </button>
        </section>

        {/* Footer CTA */}
        <section className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 text-center'>
          <h3 className='text-2xl font-bold text-gray-800 mb-4'>Have Questions?</h3>
          <p className='text-gray-700 mb-6'>
            Our support team is ready to help you get started with MediConnect.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button 
              onClick={() => navigate('/contact')}
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition'
            >
              Contact Us
            </button>
            <button 
              onClick={() => navigate('/medicines')}
              className='border-2 border-blue-600 hover:bg-blue-50 text-blue-600 px-6 py-2 rounded-lg font-semibold transition'
            >
              Explore Services
            </button>
          </div>
        </section>

      </div>
    </div>
  )
}

export default About

import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Contact = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      toast.error('Please fill all fields')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Invalid email format')
      return
    }

    try {
      setLoading(true)
      
      // Store in localStorage (or you can send to backend if API exists)
      const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]')
      messages.push({
        id: Date.now(),
        ...formData,
        timestamp: new Date().toLocaleString()
      })
      localStorage.setItem('contactMessages', JSON.stringify(messages))
      
      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white'>
      
      {/* Hero Section */}
      <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white py-12 px-4'>
        <div className='max-w-6xl mx-auto text-center'>
          <h1 className='text-4xl md:text-5xl font-bold mb-4'>Contact Us</h1>
          <p className='text-lg text-blue-100'>We're here to help. Get in touch with us anytime.</p>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-12'>
        
        {/* Contact Info Cards */}
        <div className='grid md:grid-cols-3 gap-8 mb-16'>
          {/* Address */}
          <div className='bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition'>
            <div className='text-5xl mb-4'>📍</div>
            <h3 className='text-xl font-bold text-gray-800 mb-4'>Our Office</h3>
            <p className='text-gray-700 mb-2'>
              MediConnect Healthcare Hub<br />
              4th Floor, Tech Park<br />
              Sector 21, Delhi, India 110001
            </p>
            <p className='text-gray-600 text-sm'>We're located in the heart of the city for easy access.</p>
          </div>

          {/* Phone */}
          <div className='bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition cursor-pointer'>
            <div className='text-5xl mb-4'>📞</div>
            <h3 className='text-xl font-bold text-gray-800 mb-4'>Phone</h3>
            <a href='tel:+919334167257' className='text-blue-600 hover:text-blue-700 font-semibold mb-2 block'>+91 93341 67257</a>
            <a href='tel:+919876543210' className='text-blue-600 hover:text-blue-700 font-semibold mb-4 block'>+91 98765 43210</a>
            <p className='text-gray-600 text-sm'>Available Monday to Sunday, 9 AM - 9 PM</p>
          </div>

          {/* Email */}
          <div className='bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition cursor-pointer'>
            <div className='text-5xl mb-4'>📧</div>
            <h3 className='text-xl font-bold text-gray-800 mb-4'>Email</h3>
            <a href='mailto:support@mediconnect.com' className='text-blue-600 hover:text-blue-700 font-semibold mb-2 block'>support@mediconnect.com</a>
            <a href='mailto:info@mediconnect.com' className='text-blue-600 hover:text-blue-700 font-semibold mb-4 block'>info@mediconnect.com</a>
            <p className='text-gray-600 text-sm'>We'll respond within 24 hours</p>
          </div>
        </div>

        {/* Main Contact Section */}
        <div className='grid md:grid-cols-2 gap-12 mb-16'>
          
          {/* Contact Form */}
          <div className='bg-white rounded-lg shadow-lg p-8'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6'>Send us a Message</h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              
              {/* Name */}
              <div>
                <label className='block text-gray-700 font-semibold mb-2'>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              {/* Email */}
              <div>
                <label className='block text-gray-700 font-semibold mb-2'>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              {/* Phone */}
              <div>
                <label className='block text-gray-700 font-semibold mb-2'>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              {/* Subject */}
              <div>
                <label className='block text-gray-700 font-semibold mb-2'>Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value="">Select a subject</option>
                  <option value="appointment">Appointment Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="technical">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className='block text-gray-700 font-semibold mb-2'>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  rows="5"
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className='w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2'
              >
                {loading ? 'Sending...' : '✉️ Send Message'}
              </button>
            </form>
          </div>

          {/* Additional Info */}
          <div className='space-y-8'>
            {/* Office Hours */}
            <div className='bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6'>
              <h3 className='text-xl font-bold text-gray-800 mb-4'>⏰ Office Hours</h3>
              <div className='space-y-2 text-gray-700'>
                <p><span className='font-semibold'>Monday - Friday:</span> 9:00 AM - 9:00 PM</p>
                <p><span className='font-semibold'>Saturday:</span> 10:00 AM - 6:00 PM</p>
                <p><span className='font-semibold'>Sunday:</span> 11:00 AM - 5:00 PM</p>
              </div>
            </div>

            {/* Services */}
            <div className='bg-green-50 border-l-4 border-green-500 rounded-lg p-6'>
              <h3 className='text-xl font-bold text-gray-800 mb-4'>🏥 Services</h3>
              <ul className='text-gray-700 space-y-2'>
                <li>✓ Doctor Appointments</li>
                <li>✓ Online Consultation</li>
                <li>✓ Prescription Management</li>
                <li>✓ Medicine Delivery</li>
                <li>✓ Ambulance Service</li>
                <li>✓ Health Records</li>
              </ul>
            </div>

            {/* FAQ */}
            <div className='bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6'>
              <h3 className='text-xl font-bold text-gray-800 mb-4'>❓ FAQ</h3>
              <p className='text-gray-700 mb-4'>
                Have a question? Check our FAQ section for quick answers about common concerns.
              </p>
              <button 
                onClick={() => navigate('/faq')}
                className='text-purple-600 hover:text-purple-700 font-semibold transition hover:underline'
              >
                Read FAQ →
              </button>
            </div>

            {/* Social Media */}
            <div className='bg-gray-50 border-l-4 border-gray-400 rounded-lg p-6'>
              <h3 className='text-xl font-bold text-gray-800 mb-4'>🌐 Follow Us</h3>
              <div className='flex gap-6'>
                <a 
                  href='https://www.facebook.com/mediconnect' 
                  target='_blank' 
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:text-blue-700 hover:scale-125 transition text-3xl'
                  title='Facebook'
                >
                  👍
                </a>
                <a 
                  href='https://www.twitter.com/mediconnect' 
                  target='_blank' 
                  
            onClick={() => navigate('/careers')}
            className='bg-white hover:bg-blue-50 text-blue-600 px-8 py-3 rounded-lg font-semibold transition'
          
                  className='text-blue-400 hover:text-blue-500 hover:scale-125 transition text-3xl'
                  title='Twitter'
                >
                  𝕏
                </a>
                <a 
                  href='https://www.instagram.com/mediconnect' 
                  target='_blank' 
                  rel='noopener noreferrer'
                  className='text-pink-600 hover:text-pink-700 hover:scale-125 transition text-3xl'
                  title='Instagram'
                >
                  📷
                </a>
                <a 
                  href='https://www.youtube.com/mediconnect' 
                  target='_blank' 
                  rel='noopener noreferrer'
                  className='text-red-600 hover:text-red-700 hover:scale-125 transition text-3xl'
                  title='YouTube'
                >
                  ▶️
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Careers Section */}
        <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-12 text-center mb-8'>
          <h2 className='text-3xl font-bold mb-4'>Join Our Team</h2>
          <p className='mb-6 text-blue-100'>
            We're always looking for talented individuals to join MediConnect. If you're passionate about healthcare technology, we'd love to hear from you.
          </p>
          <button className='bg-white hover:bg-blue-50 text-blue-600 px-8 py-3 rounded-lg font-semibold transition'>
            Explore Careers →
          </button>
        </div>

      </div>
    </div>
  )
}

export default Contact

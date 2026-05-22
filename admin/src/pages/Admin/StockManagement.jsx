import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'

const StockManagement = () => {
    const { aToken } = useContext(AdminContext)
    const [medicines, setMedicines] = useState([])
    const [stats, setStats] = useState(null)
    const [selectedMedicine, setSelectedMedicine] = useState(null)
    const [quantity, setQuantity] = useState('')
    const [operation, setOperation] = useState('add')
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchMedicinesStock()
        fetchStats()
    }, [])

    const fetchMedicinesStock = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/stock/medicines-stock', {
                headers: { atoken: aToken }
            })
            const data = await response.json()
            if (data.success) {
                setMedicines(data.medicines)
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching medicines:', error)
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/stock/stock-stats', {
                headers: { atoken: aToken }
            })
            const data = await response.json()
            if (data.success) {
                setStats(data.stats)
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    const handleUpdateStock = async () => {
        if (!selectedMedicine || !quantity) {
            setMessage('Please select a medicine and enter quantity')
            return
        }

        try {
            const response = await fetch('http://localhost:4000/api/stock/update-stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    atoken: aToken
                },
                body: JSON.stringify({
                    medicineId: selectedMedicine._id,
                    quantity: parseInt(quantity),
                    operation: operation
                })
            })
            const data = await response.json()
            if (data.success) {
                setMessage(`✅ ${data.medicine.name} stock updated successfully`)
                setSelectedMedicine(null)
                setQuantity('')
                fetchMedicinesStock()
                fetchStats()
                setTimeout(() => setMessage(''), 3000)
            } else {
                setMessage(`❌ Error: ${data.message}`)
            }
        } catch (error) {
            setMessage(`❌ Error: ${error.message}`)
        }
    }

    const filteredMedicines = medicines.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            med.category.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterStatus === 'all' || med.status === filterStatus
        return matchesSearch && matchesFilter
    })

    return (
        <div className='min-h-screen bg-gray-50 p-8'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-4xl font-bold text-gray-800 mb-2'>Stock Management</h1>
                    <p className='text-gray-600'>Manage dispensary and pharmacy inventory</p>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                        <div className='bg-white rounded-lg shadow p-6 border-l-4 border-blue-500'>
                            <p className='text-gray-600 text-sm'>Total Medicines</p>
                            <p className='text-3xl font-bold text-blue-600'>{stats.totalMedicines}</p>
                        </div>
                        <div className='bg-white rounded-lg shadow p-6 border-l-4 border-green-500'>
                            <p className='text-gray-600 text-sm'>In Stock</p>
                            <p className='text-3xl font-bold text-green-600'>{stats.inStock}</p>
                        </div>
                        <div className='bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500'>
                            <p className='text-gray-600 text-sm'>Low Stock</p>
                            <p className='text-3xl font-bold text-yellow-600'>{stats.lowStock}</p>
                        </div>
                        <div className='bg-white rounded-lg shadow p-6 border-l-4 border-red-500'>
                            <p className='text-gray-600 text-sm'>Out of Stock</p>
                            <p className='text-3xl font-bold text-red-600'>{stats.outOfStock}</p>
                        </div>
                    </div>
                )}

                {/* Message */}
                {message && (
                    <div className={`p-4 rounded-lg mb-8 ${message.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {message}
                    </div>
                )}

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Update Stock Form */}
                    <div className='bg-white rounded-lg shadow p-6'>
                        <h2 className='text-2xl font-bold text-gray-800 mb-6'>Update Stock</h2>

                        <div className='space-y-4'>
                            {/* Search Medicine */}
                            <div>
                                <label className='block text-gray-700 font-semibold mb-2'>Select Medicine</label>
                                <div className='relative'>
                                    <input
                                        type="text"
                                        placeholder='Search medicine...'
                                        onChange={(e) => {
                                            const term = e.target.value
                                            setSearchTerm(term)
                                            if (term && filteredMedicines.length > 0) {
                                                setSelectedMedicine(filteredMedicines[0])
                                            }
                                        }}
                                        className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500'
                                    />
                                </div>
                                <div className='mt-2 max-h-40 overflow-y-auto'>
                                    {filteredMedicines.map((med, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedMedicine(med)
                                                setSearchTerm('')
                                            }}
                                            className='w-full text-left p-2 hover:bg-blue-50 border-b'
                                        >
                                            <p className='font-semibold'>{med.name}</p>
                                            <p className='text-sm text-gray-600'>Current: {med.stockCount} units</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Selected Medicine */}
                            {selectedMedicine && (
                                <div className='bg-blue-50 p-4 rounded-lg'>
                                    <p className='font-semibold text-gray-800'>{selectedMedicine.name}</p>
                                    <p className='text-sm text-gray-600'>Current Stock: {selectedMedicine.stockCount} units</p>
                                    <p className={`text-sm font-semibold ${
                                        selectedMedicine.status === 'low_stock' ? 'text-yellow-600' :
                                        selectedMedicine.status === 'out_of_stock' ? 'text-red-600' :
                                        'text-green-600'
                                    }`}>
                                        Status: {selectedMedicine.status === 'low_stock' ? '⚠️ Low Stock' :
                                                 selectedMedicine.status === 'out_of_stock' ? '❌ Out of Stock' :
                                                 '✅ Available'}
                                    </p>
                                </div>
                            )}

                            {/* Operation */}
                            <div>
                                <label className='block text-gray-700 font-semibold mb-2'>Operation</label>
                                <select
                                    value={operation}
                                    onChange={(e) => setOperation(e.target.value)}
                                    className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500'
                                >
                                    <option value="add">Add Stock</option>
                                    <option value="subtract">Remove Stock</option>
                                </select>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className='block text-gray-700 font-semibold mb-2'>Quantity</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder='Enter quantity'
                                    className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500'
                                />
                            </div>

                            {/* Update Button */}
                            <button
                                onClick={handleUpdateStock}
                                className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all'
                            >
                                Update Stock
                            </button>
                        </div>
                    </div>

                    {/* Medicines List */}
                    <div className='lg:col-span-2'>
                        <div className='bg-white rounded-lg shadow p-6'>
                            <h2 className='text-2xl font-bold text-gray-800 mb-6'>Inventory</h2>

                            {/* Filter */}
                            <div className='mb-6 flex gap-2'>
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterStatus('normal')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        filterStatus === 'normal' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    In Stock
                                </button>
                                <button
                                    onClick={() => setFilterStatus('low_stock')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        filterStatus === 'low_stock' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    Low Stock
                                </button>
                                <button
                                    onClick={() => setFilterStatus('out_of_stock')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        filterStatus === 'out_of_stock' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    Out of Stock
                                </button>
                            </div>

                            {/* Medicines Table */}
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead className='bg-gray-100 border-b'>
                                        <tr>
                                            <th className='px-4 py-3 text-left font-semibold'>Medicine Name</th>
                                            <th className='px-4 py-3 text-left font-semibold'>Category</th>
                                            <th className='px-4 py-3 text-center font-semibold'>Stock</th>
                                            <th className='px-4 py-3 text-center font-semibold'>Price</th>
                                            <th className='px-4 py-3 text-center font-semibold'>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMedicines.map((med, idx) => (
                                            <tr key={idx} className='border-b hover:bg-gray-50'>
                                                <td className='px-4 py-3 font-semibold'>{med.name}</td>
                                                <td className='px-4 py-3'>{med.category}</td>
                                                <td className='px-4 py-3 text-center'>
                                                    <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold'>
                                                        {med.stockCount}
                                                    </span>
                                                </td>
                                                <td className='px-4 py-3 text-center'>Rs {med.price}</td>
                                                <td className='px-4 py-3 text-center'>
                                                    <span className={`px-3 py-1 rounded-full font-semibold text-sm ${
                                                        med.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                                                        med.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                        {med.status === 'low_stock' ? '⚠️ Low' :
                                                         med.status === 'out_of_stock' ? '❌ Out' :
                                                         '✅ OK'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StockManagement

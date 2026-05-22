import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Medicines = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [medicines, setMedicines] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Fetch all medicines
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/medicine/all-medicines`);
      if (data.success) {
        setMedicines(data.medicines);
        setFiltered(data.medicines);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/medicine/categories`);
      if (data.success) {
        setCategories(["All", ...data.categories]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch price range
  const fetchPriceRange = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/medicine/price-range`);
      if (data.success) {
        setMinPrice(data.minPrice);
        setMaxPrice(data.maxPrice);
        setPriceRange([data.minPrice, data.maxPrice]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
    fetchPriceRange();
  }, [backendUrl]);

  // Advanced search with filters
  const performSearch = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/medicine/search-medicines`, {
        query: searchTerm,
        category: selectedCategory === "All" ? null : selectedCategory,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        inStockOnly: inStockOnly,
        sortBy: sortBy
      });
      
      if (data.success) {
        setFiltered(data.medicines);
      }
    } catch (error) {
      console.log(error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Trigger search when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, priceRange, inStockOnly, sortBy]);

  // Add to cart
  const addToCart = (medicine) => {
    const existing = cart.find((item) => item._id === medicine._id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item._id === medicine._id
            ? { ...item, cartQuantity: Math.min(item.cartQuantity + 1, medicine.stockCount || 100) }
            : item
        )
      );
      toast.info(`${medicine.name} quantity updated`);
    } else {
      setCart([...cart, { ...medicine, cartQuantity: 1 }]);
      toast.success(`${medicine.name} added to cart! 🛒`);
    }
    
    setTimeout(() => {
      setCartOpen(true);
    }, 300);
  };

  // Remove from cart
  const removeFromCart = (medicineId) => {
    const medicine = cart.find(item => item._id === medicineId);
    setCart(cart.filter((item) => item._id !== medicineId));
    toast.info(`${medicine?.name} removed from cart`);
  };

  // Update quantity
  const updateQuantity = (medicineId, quantity) => {
    const medicine = cart.find(item => item._id === medicineId);
    const maxStock = medicine?.stockCount || 100;
    
    if (quantity <= 0) {
      removeFromCart(medicineId);
    } else if (quantity > maxStock) {
      toast.warning(`Only ${maxStock} units available`);
    } else {
      setCart(
        cart.map((item) =>
          item._id === medicineId ? { ...item, cartQuantity: quantity } : item
        )
      );
    }
  };

  // Calculate total and savings
  const cartStats = cart.reduce(
    (acc, item) => ({
      total: acc.total + item.price * item.cartQuantity,
      savings: acc.savings + (item.discount || 0) * item.cartQuantity,
      items: acc.items + item.cartQuantity
    }),
    { total: 0, savings: 0, items: 0 }
  );

  // Place order
  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    
    toast.success(`Order placed! Total: ₹${cartStats.total.toFixed(2)}`);
    setCart([]);
    setCartOpen(false);
    localStorage.setItem('lastOrder', JSON.stringify({ items: cart, total: cartStats.total, date: new Date() }));
  };

  const getDiscountedPrice = (price, discount) => {
    return (price - (price * discount / 100)).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">💊 Online Medicines</h1>
              <p className="text-blue-100 mt-2">Order medicines from home | Fast delivery | Verified pharmacies</p>
            </div>
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition flex items-center gap-2 text-lg"
            >
              🛒 Cart ({cart.length})
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold animate-pulse">
                  {cartStats.items}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search medicines by name, dosage, manufacturer... (e.g., Aspirin, Cough syrup)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            {searchTerm && (
              <span className="absolute right-4 top-4 text-gray-500 text-sm">
                Found {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar - Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-5 sticky top-24 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-3">📦 Categories</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(categories.length > 0 ? categories : ["All"]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        selectedCategory === cat
                          ? "bg-blue-500 text-white font-semibold"
                          : "bg-gray-50 text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      {cat === 'All' ? '🏥 All Medicines' : `💊 ${cat}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="border-t pt-4">
                <button
                  onClick={() => setShowPriceFilter(!showPriceFilter)}
                  className="font-bold text-lg text-gray-800 w-full text-left flex justify-between items-center"
                >
                  💰 Price Range {showPriceFilter ? '▼' : '▶'}
                </button>
                {showPriceFilter && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Min: ₹{priceRange[0]}</label>
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Max: ₹{priceRange[1]}</label>
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Stock Filter */}
              <div className="border-t pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-gray-700 font-medium">✓ In Stock Only</span>
                </label>
              </div>

              {/* Sorting */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-gray-800 mb-3">🔄 Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="discount">Best Discount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500 text-lg">Loading medicines...</p>
                </div>
              </div>
            ) : filtered.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-6 text-lg font-medium">
                  Showing <span className="text-blue-600 font-bold">{filtered.length}</span> medicine{filtered.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((medicine) => (
                    <div
                      key={medicine._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* Image Section */}
                      <div className="relative bg-gray-100 h-56 flex items-center justify-center overflow-hidden">
                        <img
                          src={medicine.image}
                          alt={medicine.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                        {medicine.discount > 0 && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                            -{medicine.discount}%
                          </div>
                        )}
                        {!medicine.inStock && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <p className="text-white font-bold text-xl">Out of Stock</p>
                          </div>
                        )}
                      </div>

                      {/* Info Section */}
                      <div className="p-4 flex-1 flex flex-col">
                        {/* Title */}
                        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">
                          {medicine.name}
                        </h3>

                        {/* Category & Dosage */}
                        <div className="flex gap-2 mb-2">
                          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded">
                            {medicine.category}
                          </span>
                          {medicine.dosage && (
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded">
                              {medicine.dosage}
                            </span>
                          )}
                        </div>

                        {/* Manufacturer */}
                        {medicine.manufacturer && (
                          <p className="text-xs text-gray-500 mb-2">by {medicine.manufacturer}</p>
                        )}

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                          {medicine.description}
                        </p>

                        {/* Rating */}
                        {medicine.rating > 0 && (
                          <div className="flex items-center gap-1 mb-3">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm font-semibold">{medicine.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({medicine.reviews} reviews)</span>
                          </div>
                        )}

                        {/* Price Section */}
                        <div className="border-t pt-3 mt-auto">
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-2xl font-bold text-blue-600">
                              ₹{getDiscountedPrice(medicine.price, medicine.discount)}
                            </span>
                            {medicine.discount > 0 && (
                              <span className="text-lg text-gray-400 line-through">₹{medicine.price}</span>
                            )}
                          </div>

                          {/* Stock Status */}
                          <div className="mb-3">
                            {medicine.inStock && medicine.stockCount > 0 ? (
                              <div>
                                <span className="text-green-600 text-sm font-medium">✓ In Stock</span>
                                <p className="text-xs text-gray-500">{medicine.stockCount} units available</p>
                              </div>
                            ) : (
                              <span className="text-red-600 text-sm font-medium">Out of Stock</span>
                            )}
                          </div>

                          {/* Add to Cart Button */}
                          <button
                            onClick={() => addToCart(medicine)}
                            disabled={!medicine.inStock}
                            className={`w-full py-3 rounded-lg font-bold transition text-white flex items-center justify-center gap-2 ${
                              medicine.inStock
                                ? "bg-blue-500 hover:bg-blue-600 active:scale-95"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                          >
                            🛒 Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-xl mb-4">😕 No medicines found</p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setCartOpen(false)}
          ></div>
          <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl overflow-y-auto z-50 animate-slideIn">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🛒 Shopping Cart</h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl"
                >
                  ✕
                </button>
              </div>

              {cart.length > 0 ? (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        {/* Item Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{item.name}</h3>
                            <p className="text-xs text-gray-500">{item.dosage || 'Standard'}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 hover:text-red-700 font-bold text-lg"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Price */}
                        <p className="text-blue-600 font-bold mb-3">
                          ₹{getDiscountedPrice(item.price, item.discount)} each
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mb-3">
                          <button
                            onClick={() => updateQuantity(item._id, item.cartQuantity - 1)}
                            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded font-bold"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.cartQuantity}
                            onChange={(e) =>
                              updateQuantity(item._id, parseInt(e.target.value) || 0)
                            }
                            min="1"
                            max={item.stockCount || 100}
                            className="w-16 text-center border border-gray-300 rounded font-bold"
                          />
                          <button
                            onClick={() => updateQuantity(item._id, item.cartQuantity + 1)}
                            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded font-bold"
                          >
                            +
                          </button>
                          <span className="ml-auto font-bold text-blue-600">
                            ₹{(item.price * item.cartQuantity).toFixed(2)}
                          </span>
                        </div>

                        {item.stockCount && item.cartQuantity > item.stockCount && (
                          <p className="text-xs text-red-500">Only {item.stockCount} available</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Items:</span>
                      <span className="font-semibold">{cartStats.items}</span>
                    </div>
                    {cartStats.savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Savings:</span>
                        <span className="font-semibold">-₹{cartStats.savings.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-bold bg-blue-50 p-3 rounded-lg">
                      <span>Total:</span>
                      <span className="text-blue-600">₹{cartStats.total.toFixed(2)}</span>
                    </div>

                    {/* Buttons */}
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition active:scale-95"
                    >
                      ✅ Place Order
                    </button>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-bold transition"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <p className="text-5xl mb-3">🛒</p>
                    <p className="text-gray-500 text-lg">Your cart is empty</p>
                    <p className="text-gray-400 text-sm mt-2">Add medicines to continue</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Medicines;

import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
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

  // Fetch all medicines
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/medicine/all-medicines`);
      if (data.success) {
        console.log('✅ Medicines fetched:', data.medicines.length);
        setMedicines(data.medicines);
        setFiltered(data.medicines);
      }
    } catch (error) {
      console.log('❌ Error fetching medicines:', error);
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [backendUrl]);

  // Filter medicines
  useEffect(() => {
    let result = medicines;

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter((m) => m.category === selectedCategory);
    }

    // Filter by search
    if (searchTerm) {
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    console.log(`📊 Filtered: ${result.length} medicines (Category: ${selectedCategory}, Search: "${searchTerm}")`);
    setFiltered(result);
  }, [searchTerm, selectedCategory, medicines]);

  // Add to cart
  const addToCart = (medicine) => {
    console.log('🛒 Adding to cart:', medicine.name);
    
    const existing = cart.find((item) => item._id === medicine._id);
    if (existing) {
      console.log('📦 Item already in cart, updating quantity');
      setCart(
        cart.map((item) =>
          item._id === medicine._id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        )
      );
      toast.info(`${medicine.name} - Qty updated to ${existing.cartQuantity + 1}`);
    } else {
      console.log('✅ Adding new item to cart');
      setCart([...cart, { ...medicine, cartQuantity: 1 }]);
      toast.success(`${medicine.name} added to cart! ✅`);
    }
    
    // Auto-open cart
    setTimeout(() => {
      setCartOpen(true);
      console.log('📂 Cart opened automatically');
    }, 300);
  };

  // Remove from cart
  const removeFromCart = (medicineId) => {
    const item = cart.find(i => i._id === medicineId);
    console.log('❌ Removing from cart:', item?.name);
    setCart(cart.filter((item) => item._id !== medicineId));
  };

  // Update quantity
  const updateQuantity = (medicineId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
    } else {
      console.log(`📝 Updating quantity for ${medicineId} to ${quantity}`);
      setCart(
        cart.map((item) =>
          item._id === medicineId ? { ...item, cartQuantity: quantity } : item
        )
      );
    }
  };

  // Calculate total
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0
  );

  // Get unique categories
  const categories = ["All", ...new Set(medicines.map((m) => m.category || "Other"))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">💊 Online Medicines</h1>
          <p className="text-blue-100">
            Fast delivery • Affordable prices • Trusted brands
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Cart Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search medicines by name or description..."
                value={searchTerm}
                onChange={(e) => {
                  console.log('🔍 Searching for:', e.target.value);
                  setSearchTerm(e.target.value);
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-2">
                🔎 Found {filtered.length} medicine{filtered.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={() => {
              console.log('🛒 Cart clicked, items:', cart.length);
              setCartOpen(!cartOpen);
            }}
            className="relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg transition flex items-center gap-2 font-bold shadow-lg"
          >
            🛒 Cart
            {cart.length > 0 && (
              <span className="bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold animate-pulse">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Categories */}
          <div className="w-full md:w-48 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h3 className="font-bold text-lg mb-4 text-gray-800">📦 Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      console.log('📂 Filter by category:', cat);
                      setSelectedCategory(cat);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${
                      selectedCategory === cat
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {cat === 'All' ? '🏥 All Medicines' : `💊 ${cat}`}
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600">
                  <strong>📍 Selected:</strong> {selectedCategory}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Medicines Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500 text-lg">Loading medicines...</p>
                </div>
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((medicine) => (
                  <div
                    key={medicine._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
                  >
                    {/* Medicine Image */}
                    <div className="bg-gray-100 h-48 flex items-center justify-center border-b border-gray-200">
                      <div className="text-6xl">💊</div>
                    </div>

                    {/* Medicine Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">
                        {medicine.name}
                      </h3>
                      <p className="text-blue-500 text-sm font-medium mb-2">
                        {medicine.category || 'Uncategorized'}
                      </p>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {medicine.description || 'Quality medicine'}
                      </p>

                      {/* Stock Status */}
                      <div className="mb-3">
                        {medicine.inStock ? (
                          <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                            ✓ In Stock
                          </span>
                        ) : (
                          <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                            ✕ Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Price and Button */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{medicine.price}
                        </span>
                        <button
                          onClick={() => addToCart(medicine)}
                          className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center gap-2 shadow-md"
                        >
                          🛒 Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-2xl mb-4">🔍 No medicines found</p>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search or category filters
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Modal - FlipCart Style */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-end md:items-center justify-end md:justify-center p-4">
            <div className="bg-white rounded-t-lg md:rounded-lg shadow-2xl w-full md:max-w-2xl max-h-96 overflow-y-auto md:overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex justify-between items-center shadow-lg">
                <h2 className="text-2xl font-bold">🛒 Shopping Cart</h2>
                <button
                  onClick={() => {
                    console.log('❌ Cart closed');
                    setCartOpen(false);
                  }}
                  className="text-white hover:text-gray-200 text-3xl font-light transition"
                >
                  ✕
                </button>
              </div>

              {/* Cart Items */}
              {cart.length > 0 ? (
                <>
                  <div className="p-6 space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gray-50"
                      >
                        {/* Item Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg">
                              💊 {item.name}
                            </h3>
                            <p className="text-blue-500 text-sm font-medium">
                              {item.category}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              console.log('❌ Removing:', item.name);
                              removeFromCart(item._id);
                              toast.info(`${item.name} removed`);
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-xl transition"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between">
                          {/* Price */}
                          <div>
                            <p className="text-gray-600 text-xs">Unit Price</p>
                            <p className="text-xl font-bold text-blue-600">
                              ₹{item.price}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-300">
                            <button
                              onClick={() => {
                                console.log('➖ Qty--');
                                updateQuantity(item._id, item.cartQuantity - 1);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded flex items-center justify-center font-bold transition"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={item.cartQuantity}
                              onChange={(e) => {
                                const qty = parseInt(e.target.value) || 0;
                                console.log('📝 Qty:', qty);
                                updateQuantity(item._id, qty);
                              }}
                              className="w-10 text-center border-0 font-bold text-lg"
                              min="1"
                            />
                            <button
                              onClick={() => {
                                console.log('➕ Qty++');
                                updateQuantity(item._id, item.cartQuantity + 1);
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded flex items-center justify-center font-bold transition"
                            >
                              +
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right">
                            <p className="text-gray-600 text-xs">Subtotal</p>
                            <p className="text-xl font-bold text-green-600">
                              ₹{item.price * item.cartQuantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t bg-blue-50 p-6 sticky bottom-0">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-base">
                        <span className="text-gray-700">Subtotal ({cart.length} items):</span>
                        <span className="font-semibold">₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-gray-700">Delivery:</span>
                        <span className="font-semibold text-green-600">FREE 🎉</span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">₹{cartTotal}</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          console.log('🛒 Continue shopping');
                          setCartOpen(false);
                        }}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-lg font-bold transition"
                      >
                        Continue Shopping
                      </button>
                      <button
                        onClick={() => {
                          console.log('✅ Order placed:', {
                            items: cart.length,
                            total: cartTotal,
                            medicines: cart.map(c => ({ name: c.name, qty: c.cartQuantity }))
                          });
                          toast.success(`🎉 Order placed! Total: ₹${cartTotal}`);
                          setCart([]);
                          setCartOpen(false);
                        }}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-bold transition shadow-lg"
                      >
                        ✅ Place Order
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-80">
                  <div className="text-center">
                    <p className="text-6xl mb-4">🛒</p>
                    <p className="text-gray-500 text-xl mb-4 font-semibold">
                      Your cart is empty
                    </p>
                    <p className="text-gray-400 mb-6">
                      Add medicines to start shopping!
                    </p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold transition"
                    >
                      Start Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;

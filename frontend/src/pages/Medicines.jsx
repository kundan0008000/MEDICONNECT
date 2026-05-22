import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Medicines = () => {
  const { backendUrl } = useContext(AppContext);
  const [medicines, setMedicines] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage on mount
    try {
      const saved = localStorage.getItem("medicineCart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(["All"]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("medicineCart", JSON.stringify(cart));
  }, [cart]);

  // Fetch all medicines on component mount
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        setLoading(true);
        console.log("Fetching medicines from:", `${backendUrl}/api/medicine/all-medicines`);
        
        const response = await axios.get(`${backendUrl}/api/medicine/all-medicines`);
        console.log("Response:", response.data);
        
        if (response.data.success && response.data.medicines) {
          setMedicines(response.data.medicines);
          setFiltered(response.data.medicines);
          
          // Extract unique categories
          const uniqueCategories = ["All", ...new Set(response.data.medicines.map(m => m.category).filter(c => c))];
          setCategories(uniqueCategories);
          
          toast.success(`Loaded ${response.data.medicines.length} medicines`);
        } else {
          toast.error("Failed to load medicines");
          setMedicines([]);
          setFiltered([]);
        }
      } catch (error) {
        console.error("Error fetching medicines:", error);
        toast.error("Failed to load medicines: " + (error.message || "Connection error"));
        setMedicines([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };

    if (backendUrl) {
      loadMedicines();
    }
  }, [backendUrl]);

  // Filter medicines based on search and category
  useEffect(() => {
    let result = medicines;

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter((m) => m.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter((m) =>
        m.name.toLowerCase().includes(search) ||
        m.description?.toLowerCase().includes(search) ||
        m.category.toLowerCase().includes(search) ||
        m.dosage?.toLowerCase().includes(search) ||
        m.manufacturer?.toLowerCase().includes(search)
      );
    }

    setFiltered(result);
  }, [searchTerm, selectedCategory, medicines]);

  // Add to cart
  const addToCart = (medicine) => {
    const existing = cart.find((item) => item._id === medicine._id);
    
    if (existing) {
      // Increase quantity if already in cart
      const maxStock = medicine.stockCount || medicine.quantity || 100;
      if (existing.cartQuantity < maxStock) {
        setCart(
          cart.map((item) =>
            item._id === medicine._id
              ? { ...item, cartQuantity: item.cartQuantity + 1 }
              : item
          )
        );
        toast.info(`✅ ${medicine.name} - Qty: ${existing.cartQuantity + 1}`);
      } else {
        toast.warning(`Only ${maxStock} units available`);
      }
    } else {
      // Add new item to cart
      setCart([...cart, { ...medicine, cartQuantity: 1 }]);
      toast.success(`🛒 ${medicine.name} added to cart!`);
    }

    // Auto-open cart
    setTimeout(() => setCartOpen(true), 300);
  };

  // Remove from cart
  const removeFromCart = (medicineId) => {
    const item = cart.find(i => i._id === medicineId);
    setCart(cart.filter((item) => item._id !== medicineId));
    if (item) {
      toast.info(`❌ ${item.name} removed from cart`);
    }
  };

  // Update quantity
  const updateQuantity = (medicineId, quantity) => {
    const item = cart.find(i => i._id === medicineId);
    const maxStock = item?.stockCount || item?.quantity || 100;

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

  // Calculate cart totals
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0);

  // Place order
  const placeOrder = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    // Save order and show confirmation
    const order = {
      items: cart,
      total: cartTotal,
      date: new Date().toISOString(),
      id: `ORD-${Date.now()}`
    };

    localStorage.setItem("lastOrder", JSON.stringify(order));
    toast.success(`✅ Order placed! Total: ₹${cartTotal.toFixed(2)}`);
    
    // Clear cart and close
    setCart([]);
    setCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">💊 Online Medicines</h1>
            <p className="text-blue-100 mt-1 text-sm md:text-base">Order from home • Fast delivery • Verified pharmacies</p>
          </div>
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative bg-white text-blue-600 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold hover:bg-blue-50 transition flex items-center gap-2"
          >
            🛒 Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-xs md:text-sm font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 Search medicines... (name, dosage, brand)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <p className="text-gray-600 mt-2 text-sm">
              Found <span className="font-bold text-blue-600">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar - Categories */}
          <div className="hidden md:block w-48 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h3 className="font-bold text-lg mb-4">📦 Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition font-medium text-sm ${
                      selectedCategory === cat
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {cat === 'All' ? '🏥 All' : `💊 ${cat}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Loading medicines...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-6 text-sm md:text-base">
                  Showing <span className="font-bold text-blue-600">{filtered.length}</span> medicine{filtered.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filtered.map((medicine) => (
                    <div
                      key={medicine._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
                    >
                      {/* Image */}
                      <div className="bg-gray-100 h-40 md:h-48 flex items-center justify-center overflow-hidden">
                        <img
                          src={medicine.image}
                          alt={medicine.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%' y='50%' font-size='16' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EMedicine Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-2 mb-1">
                          {medicine.name}
                        </h3>
                        
                        <div className="flex gap-2 mb-2 flex-wrap">
                          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                            {medicine.category}
                          </span>
                          {medicine.dosage && (
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                              {medicine.dosage}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">
                          {medicine.description}
                        </p>

                        {/* Price & Stock */}
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xl md:text-2xl font-bold text-blue-600">
                              ₹{medicine.price}
                            </span>
                            {medicine.inStock ? (
                              <span className="text-green-600 text-xs font-semibold">✓ In Stock</span>
                            ) : (
                              <span className="text-red-600 text-xs font-semibold">Out of Stock</span>
                            )}
                          </div>

                          <button
                            onClick={() => addToCart(medicine)}
                            disabled={!medicine.inStock}
                            className={`w-full py-2 rounded-lg font-bold transition text-sm md:text-base ${
                              medicine.inStock
                                ? "bg-blue-500 hover:bg-blue-600 text-white active:scale-95"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {medicine.inStock ? "🛒 Add to Cart" : "Unavailable"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center">
                <p className="text-gray-500 text-lg md:text-xl mb-2">😕 No medicines found</p>
                <p className="text-gray-400 text-sm md:text-base">Try different search terms or categories</p>
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
            <div className="p-4 md:p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold">🛒 Shopping Cart</h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl md:text-3xl"
                >
                  ✕
                </button>
              </div>

              {cart.length > 0 ? (
                <>
                  {/* Items */}
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="border border-gray-200 rounded-lg p-3 md:p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-sm md:text-base">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 text-xs md:text-sm">
                              ₹{item.price} each
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 hover:text-red-700 text-lg font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item._id, item.cartQuantity - 1)}
                            className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm font-bold"
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
                            className="w-12 text-center border border-gray-300 rounded text-sm font-bold"
                          />
                          <button
                            onClick={() => updateQuantity(item._id, item.cartQuantity + 1)}
                            className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm font-bold"
                          >
                            +
                          </button>
                          <span className="ml-auto font-bold text-blue-600 text-sm md:text-base">
                            ₹{(item.price * item.cartQuantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-gray-700 text-sm">
                      <span>Items:</span>
                      <span className="font-semibold">{totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold bg-blue-50 p-3 rounded-lg">
                      <span>Total:</span>
                      <span className="text-blue-600">₹{cartTotal.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={placeOrder}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition text-sm md:text-base"
                    >
                      ✅ Place Order
                    </button>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-bold transition text-sm md:text-base"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-96">
                  <p className="text-5xl mb-3">🛒</p>
                  <p className="text-gray-500 text-lg font-medium text-center">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2 text-center">Add medicines to get started</p>
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

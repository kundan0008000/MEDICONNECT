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
        setMedicines(data.medicines);
        setFiltered(data.medicines);
      }
    } catch (error) {
      console.log(error);
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
      toast.info(`${medicine.name} - Quantity updated to ${existing.cartQuantity + 1}`);
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
    setCart(cart.filter((item) => item._id !== medicineId));
  };

  // Update quantity
  const updateQuantity = (medicineId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
    } else {
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
  const categories = ["All", ...new Set(medicines.map((m) => m.category))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Online Medicines</h1>
          <p className="text-blue-100">
            Order medicines from the comfort of your home
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search medicines by name..."
              value={searchTerm}
              onChange={(e) => {
                console.log('🔍 Searching for:', e.target.value);
                setSearchTerm(e.target.value);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-1">
                Found {filtered.length} medicine{filtered.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={() => {
              console.log('🛒 Cart clicked, items:', cart.length);
              setCartOpen(!cartOpen);
            }}
            className="relative bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition flex items-center gap-2 font-semibold"
          >
            🛒 Cart ({cart.length})
            {cart.length > 0 && (
              <span className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold animate-pulse">
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
                <p className="text-sm text-gray-600">
                  <strong>Selected:</strong> {selectedCategory}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Medicines Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading medicines...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((medicine) => (
                  <div
                    key={medicine._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    {/* Medicine Image */}
                    <div className="bg-gray-100 h-48 flex items-center justify-center">
                      <img
                        src={medicine.image}
                        alt={medicine.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Medicine Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800 mb-1">
                        {medicine.name}
                      </h3>
                      <p className="text-blue-500 text-sm font-medium mb-2">
                        {medicine.category}
                      </p>
                      <p className="text-gray-600 text-sm mb-3">
                        {medicine.description}
                      </p>

                      {/* Price and Button */}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-blue-600">
                          ₹{medicine.price}
                        </span>
                        <button
                          onClick={() => addToCart(medicine)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition text-sm font-medium active:scale-95 flex items-center gap-2"
                        >
                          🛒 Add to Cart
                        </button>
                      </div>

                      {/* Stock Status */}
                      <div className="mt-2">
                        {medicine.inStock ? (
                          <span className="text-green-600 text-sm font-medium">
                            ✓ In Stock
                          </span>
                        ) : (
                          <span className="text-red-600 text-sm font-medium">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 text-lg">
                  No medicines found. Try adjusting your search.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-lg overflow-y-auto z-50">
          <div className="p-6">
            {/* Cart Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Shopping Cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Cart Items */}
            {cart.length > 0 ? (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        ₹{item.price} each
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.cartQuantity - 1
                            )
                          }
                          className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.cartQuantity}
                          onChange={(e) =>
                            updateQuantity(
                              item._id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-12 text-center border border-gray-300 rounded"
                        />
                        <button
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.cartQuantity + 1
                            )
                          }
                          className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                        >
                          +
                        </button>
                        <span className="ml-auto font-semibold">
                          ₹{item.price * item.cartQuantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4 text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">₹{cartTotal}</span>
                  </div>
                  <button
                    onClick={() => {
                      alert(`Order placed! Total: ₹${cartTotal}`);
                      setCart([]);
                      setCartOpen(false);
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Place Order
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500 text-center">
                  Your cart is empty. Add medicines to continue!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setCartOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Medicines;

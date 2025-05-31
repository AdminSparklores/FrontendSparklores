import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProduct, fetchCharm, BASE_URL } from '../../utils/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for cart items
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    email: '',
    address: '',
    phone: '',
    province: '',
    postalCode: ''
  });

  // Newsletter logic
  const [showNewsletterCheckbox, setShowNewsletterCheckbox] = useState(false);
  const [newsletterChecked, setNewsletterChecked] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  const [formError, setFormError] = useState(null); // For validation
  const [formTouched, setFormTouched] = useState(false);

  // Check newsletter subscription when email changes
  useEffect(() => {
    const fetchNewsletterStatus = async () => {
      setShowNewsletterCheckbox(false);
      setNewsletterError("");
      setNewsletterChecked(false);

      // Only check if email is valid and not empty
      if (!shippingAddress.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
        setShowNewsletterCheckbox(false);
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/api/newsletters/`);
        if (!res.ok) throw new Error("Failed to check newsletter subscriptions");
        const data = await res.json();
        const userSubscribed = data.some(item =>
          (item.user_email || item.email) &&
          (item.user_email || item.email).toLowerCase() === shippingAddress.email.toLowerCase()
        );
        setShowNewsletterCheckbox(!userSubscribed);
      } catch (err) {
        setNewsletterError("Failed to check newsletter subscription");
        setShowNewsletterCheckbox(false);
      }
    };
    fetchNewsletterStatus();
  }, [shippingAddress.email]);

  // Handle shipping address input changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
    setFormTouched(true);
  };

  // Fetch item details when component mounts
  useEffect(() => {
    const fetchItemDetails = async () => {
      const selectedItems = location.state?.selectedItems || [];
      try {
        if (selectedItems.length > 0) {
          const enhancedItems = await Promise.all(
            selectedItems.map(async (item) => {
              try {
                const product = await fetchProduct(item.productId || item.id);
                let charmDetails = [];
                if (item.charms && item.charms.length > 0) {
                  if (typeof item.charms[0] === 'object') {
                    charmDetails = item.charms;
                  } else {
                    charmDetails = item.charms.map(image => ({ image }));
                  }
                }
                return {
                  ...item,
                  id: item.id,
                  name: product.name,
                  image: (product.images && product.images.length > 0) ? product.images[0].image_url : item.image,
                  price: item.price,
                  originalPrice: item.originalPrice,
                  discount: item.discount,
                  quantity: item.quantity,
                  charms: charmDetails,
                  message: item.message || ""
                };
              } catch (error) {
                return item;
              }
            })
          );
          setCartItems(enhancedItems);
        }
      } catch (error) {
        //
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemDetails();
  }, [location.state]);

  // Shipping options with prices
  const shippingOptions = [
    { name: "Regular", description: "Est. 2-3 days", price: 15000 },
    { name: "Express", description: "Est. next day", price: 35000 }
  ];

  const paymentMethods = [
    { name: "Virtual Account (BCA)", icon: "🏦" },
    { name: "QRIS", icon: "📱" }
  ];

  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showShippingDropdown, setShowShippingDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  // Calculate prices
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = cartItems.reduce((sum, item) => {
    if (item.discount && item.originalPrice) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);
  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const total = subtotal + shippingCost;

  // Format currency for display
  const formatCurrency = (amount) => {
    return `Rp. ${amount.toLocaleString('id-ID')},00`;
  };

  // Validation function for all required fields
  const isFormValid = () => {
    // All shippingAddress fields except the newsletter checkbox must be filled and not just whitespace
    for (const key in shippingAddress) {
      if (
        typeof shippingAddress[key] === "string" &&
        shippingAddress[key].trim() === ""
      ) {
        return false;
      }
    }
    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      return false;
    }
    // Shipping & payment selected
    if (!selectedShipping || !selectedPayment) {
      return false;
    }
    return true;
  };

  const handlePlaceOrder = () => {
    setFormTouched(true);
    if (!isFormValid()) {
      setFormError("Please fill in all fields and select shipping and payment options with a valid email.");
      return;
    }
    setFormError(null);

    const orderData = {
      items: cartItems,
      shipping: selectedShipping,
      payment: selectedPayment,
      subtotal: subtotal,
      discount: discount,
      shippingCost: shippingCost,
      total: total,
      shippingAddress: shippingAddress,
      newsletterOptIn: showNewsletterCheckbox && newsletterChecked
    };

    // Route to payment page based on payment option
    if (selectedPayment.name === "Virtual Account (BCA)") {
      navigate('/checkout/virtual-account', { state: { orderDetails: orderData } });
    } else if (selectedPayment.name === "QRIS") {
      navigate('/checkout/qris', { state: { orderDetails: orderData } });
    } else {
      // Fallback to card payment/final checkout
      navigate('/checkout/payment', { state: { orderDetails: orderData } });
    }
  };

  useEffect(() => {
    if (formTouched) {
      // live update error message for form fields
      if (!isFormValid()) {
        setFormError("Please fill in all fields and select shipping and payment options with a valid email.");
      } else {
        setFormError(null);
      }
    }
    // eslint-disable-next-line
  }, [shippingAddress, selectedShipping, selectedPayment]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfaf3] flex items-center justify-center">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdfaf3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">No items selected for checkout</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-[#e9d6a9] px-4 py-2 rounded-md hover:bg-[#e3c990]"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf3] p-6 text-[#3b322c]">
      <div className="max-w-6xl mx-auto">
        <nav className="text-sm text-[#c9c3bc] mb-4">
          Home {'>'} Your Cart {'>'} <span className="text-[#3b322c] font-medium">Checkout</span>
        </nav>

        <div className='border border-[#f2e9d5] rounded-xl p-6 bg-white'>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Checkout Form */}
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-2xl font-semibold">Checkout</h2>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Contact Information</h3>
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleAddressChange}
                  placeholder="Your Full Name"
                  className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={shippingAddress.email}
                  onChange={handleAddressChange}
                  placeholder="your.email@mail.com"
                  className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                  required
                />
                {showNewsletterCheckbox && (
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={newsletterChecked}
                      onChange={e => setNewsletterChecked(e.target.checked)}
                      disabled={newsletterLoading}
                    />
                    <span className='ms-[0.5rem]'>Mail me about exclusive offer.</span>
                    {newsletterLoading && (
                      <span className="ml-2 text-xs text-gray-500">Processing...</span>
                    )}
                  </label>
                )}
                {newsletterError && (
                  <div className="text-xs text-red-500 mt-1">{newsletterError}</div>
                )}
              </div>

              <div>
                <h3 className="font-medium mt-4 mb-2">Shipping Address</h3>
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleAddressChange}
                  placeholder="Your address"
                  className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                  required
                />
                <input
                  type="text"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleAddressChange}
                  placeholder="+6281234567890"
                  className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                  required
                />
                <div className="flex gap-4">
                  <input
                    type="text"
                    name="province"
                    value={shippingAddress.province}
                    onChange={handleAddressChange}
                    placeholder="Province, State"
                    className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                    required
                  />
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleAddressChange}
                    placeholder="12345"
                    className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 mb-3 bg-[#fdfaf3]"
                    required
                  />
                </div>
              </div>

              {/* Shipping Dropdown */}
              <div className="relative">
                <h3 className="font-medium mt-4 mb-2">Shipping Option</h3>
                <button
                  className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 bg-[#e9d6a9] text-left flex justify-between items-center"
                  onClick={() => setShowShippingDropdown(!showShippingDropdown)}
                  type="button"
                >
                  {selectedShipping ? (
                    <div className="flex justify-between w-full">
                      <span>{selectedShipping.name} ({selectedShipping.description})</span>
                      <span>{formatCurrency(selectedShipping.price)}</span>
                    </div>
                  ) : (
                    "Select shipping option"
                  )}
                  <svg
                    className={`w-5 h-5 transition-transform ${showShippingDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showShippingDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#f2e9d5] rounded-md shadow-lg">
                    {shippingOptions.map((option) => (
                      <div
                        key={option.name}
                        className={`px-4 py-3 cursor-pointer hover:bg-[#f3e3bc] ${selectedShipping?.name === option.name ? 'bg-[#f3e3bc]' : ''}`}
                        onClick={() => {
                          setSelectedShipping(option);
                          setShowShippingDropdown(false);
                        }}
                      >
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{option.name}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                          <div>{formatCurrency(option.price)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Dropdown */}
              <div className="relative">
                <h3 className="font-medium mt-4 mb-2">Payment Option</h3>
                <button
                  className="w-full border border-[#f2e9d5] rounded-md px-4 py-2 bg-[#e9d6a9] text-left flex justify-between items-center"
                  onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                  type="button"
                >
                  {selectedPayment ? (
                    <div className="flex items-center gap-2">
                      <span>{selectedPayment.icon}</span>
                      <span>{selectedPayment.name}</span>
                    </div>
                  ) : (
                    "Select payment method"
                  )}
                  <svg
                    className={`w-5 h-5 transition-transform ${showPaymentDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showPaymentDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#f2e9d5] rounded-md shadow-lg">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.name}
                        className={`px-4 py-3 cursor-pointer hover:bg-[#f3e3bc] flex items-center gap-2 ${selectedPayment?.name === method.name ? 'bg-[#f3e3bc]' : ''}`}
                        onClick={() => {
                          setSelectedPayment(method);
                          setShowPaymentDropdown(false);
                        }}
                      >
                        <span>{method.icon}</span>
                        <span>{method.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {formError && (
                <div className="text-xs text-red-500 mt-1">{formError}</div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              <h3 className="font-medium text-lg">Your Orders</h3>

              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "https://via.placeholder.com/100";
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm">x{item.quantity}</p>
                    
                    {/* Display prices with discount if applicable */}
                    {item.discount > 0 && item.originalPrice ? (
                      <div className="space-y-1">
                        <p className="font-semibold text-[#b87777]">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-400 text-sm line-through">
                            {formatCurrency(item.originalPrice * item.quantity)}
                          </p>
                          <span className="text-xs bg-[#c3a46f] text-white px-1 rounded">
                            {item.discount}% OFF
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="font-semibold text-[#b87777]">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    )}
                    {item.charms && item.charms.length > 0 && (
                      <>
                        <p className="text-sm mt-2">Charm Selection</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.charms.map((charm, index) => (
                            <div key={index} className="flex flex-col items-center">
                              <img 
                                src={charm.image || charm} 
                                alt={charm.name || `Charm ${index}`}
                                className="w-10 h-10 object-contain border border-[#f2e9d5] rounded-sm p-1"
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = "https://via.placeholder.com/40";
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {item.message && (
                      <>
                        <p className="text-sm mt-2 text-start text-gray-600">Special Message</p>
                        <p className="text-xs italic">"{item.message}"</p>
                      </>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-[#f2e9d5] text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="text-green-600">-{formatCurrency(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{selectedShipping ? formatCurrency(selectedShipping.price) : "Not selected"}</span>
                </div>
                
                <div className="flex justify-between font-semibold pt-2 border-t border-[#f2e9d5]">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            className="w-full bg-[#e9d6a9] text-lg font-medium py-3 mt-6 rounded-md hover:bg-[#e3c990] transition-colors disabled:opacity-50"
            onClick={handlePlaceOrder}
            disabled={newsletterLoading || !isFormValid()}
          >
            Place My Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;